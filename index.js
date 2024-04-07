const app = require("./app");
require("dotenv").config();
const { Server } = require("socket.io");

const http = require("http");
const User = require("./models/User");
const DuoChat = require("./models/DuoChat");
const { checkIncoming } = require("./services/appServices");
const { uploadOnCloudinaryForChat } = require("./services/UploadCloudinary");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.SOCKET_ORIGIN, process.env.SOCKET_ORIGIN2],
    methods: ["GET", "POST"],
  },
});

server.listen(process.env.PORT, () => {
  console.log(`server started at PORT ${process.env.PORT}.....`);
});

// socket.io

io.on("connection", async (socket) => {
  const { userId } = socket.handshake.query;
  const socketId = socket.id;
  // console.log("New User connected", userId);

  if (Boolean(userId)) {
    await User.findByIdAndUpdate(userId, { socketId, status: "online" });
  }

  socket.on("start-conversation", async (data, callback) => {
    try {
      const { userId, loggedInUserId } = data;

      const user = await User.findById(userId).select(
        "name username avatar status socketId"
      );

      let duoChatRoom = await DuoChat.findOne({
        users: { $size: 2, $all: [userId, loggedInUserId] },
      });

      let messages = [];

      if (duoChatRoom) {
        messages = duoChatRoom.conversation;
        messages = messages.map((message) => {
          let newMsg = { ...message.toObject() };
          newMsg["incoming"] = checkIncoming(
            String(loggedInUserId),
            String(message.fromUserId)
          );
          return newMsg;
        });
        // callback({ messages, user: user });
      } else {
        duoChatRoom = await new DuoChat({
          users: [userId, loggedInUserId],
        }).save();
      }
      callback({
        status: "success",
        messages,
        user,
        conversationId: duoChatRoom.id,
      });
    } catch (err) {
      console.log(err.message);
      // callback({status:"error", message:"Some Internal Error Occured!"})
    }
  });

  socket.on("send-new-message", async (data) => {
    const {
      message,
      type,
      toUserId,
      fromUserId,
      conversationId,
      loggedInUserId,
    } = data;
    const fromUser = await User.findById(fromUserId).select(
      "socketId name username avatar"
    );
    try {
      const toUser = await User.findById(toUserId).select(
        "socketId name username avatar"
      );

      let newMsg = message;

      // console.log(data);

      if (type === "image") {
        // console.log(message, "index");
        // const imgBuffer = Buffer.from(message, "base64");
        newMsg = await uploadOnCloudinaryForChat(message, "images");
      } else if (type === "video") {
        const videoBuffer = Buffer.from(message, "base64");
        newMsg = await uploadOnCloudinaryForChat(videoBuffer, "videos");
      }
      console.log(newMsg);

      let newMessage = {
        toUserId,
        fromUserId,
        message: newMsg,
        type,
      };

      const conv = await DuoChat.findByIdAndUpdate(
        conversationId,
        {
          $push: { conversation: newMessage },
        },
        { new: true }
      );
      const readyMessage = (newMessage = conv.conversation.at(-1));
      // console.log(readyMessage);

      let newReadyMessage = {
        message: readyMessage.message,
        read: readyMessage.read,
        id: readyMessage.id,
        type: readyMessage.type,
        incoming: false,
      };

      // console.log(newReadyMessage);

      io.to(fromUser.socketId).emit("recieved-new-message", {
        message: newReadyMessage,
        conversationId,
        user: toUser,
        loggedInUserId,
      });
      newReadyMessage.incoming = !newReadyMessage.incoming;
      io.to(toUser.socketId).emit("recieved-new-message", {
        message: newReadyMessage,
        conversationId,
        user: fromUser,
        loggedInUserId,
      });
    } catch (err) {
      io.to(fromUser.socketId).emit("error", {
        message: "Some Internal Error Occured!",
      });
    }
  });

  socket.on("mark-message-as-read", async ({ convId, msgId }) => {
    // console.log(convId, msgId);
    console.log("mark as read");
    await DuoChat.findByIdAndUpdate(
      convId,
      { $set: { "conversation.$[element].read": true } },
      {
        arrayFilters: [{ "element._id": { $eq: msgId } }],
        new: true, // Return the modified document
      }
    );
  });

  socket.on("fetch-conversations", async (data, callback) => {
    try {
      const { loggedInUserId } = data;
      // console.log(loggedInUserId);
      const convs = await DuoChat.find({
        users: String(loggedInUserId),
      }).populate({
        path: "users",
        select: "name username avatar",
      });
      // console.log(convs, loggedInUserId);
      const conversations = convs.map((conv) => {
        let count = 0;
        const toUser = conv.users.find(
          (user) => String(user._id) !== String(loggedInUserId)
        );
        conv.conversation.forEach((msg) => {
          if (!msg.read && String(msg.fromUserId) !== String(loggedInUserId)) {
            count++;
          }
        });
        const data = {
          conversationId: conv.id,
          user: toUser,
          unread: count,
        };
        return data;
      });
      callback(conversations);
    } catch (err) {
      console.log(err);
      callback({ status: "error", message: "Some Internal Error Occured!" });
    }
  });

  socket.on(
    "select-existing-conversation",
    async ({ id, userId }, callback) => {
      const currConv = await DuoChat.findById(id);
      const user = await User.findById(userId).select("name username avatar");
      const messages = currConv.conversation.map((msg) => {
        const newMsg = { ...msg.toObject() };
        newMsg.read = true;
        if (String(msg.toUserId) === String(userId)) {
          newMsg["incoming"] = false;
        } else {
          newMsg["incoming"] = true;
        }
        return newMsg;
      });
      await DuoChat.findByIdAndUpdate(id, { conversation: messages });
      callback({
        messages,
        conversation: { user, unread: 0, conversationId: id },
      });
    }
  );

  socket.on("send-notification", async ({ type, userId }) => {
    // console.log(userId, type);
    const user = await User.findById(userId).select("socketId");
    io.to(user.socketId).emit("new-notification", { type });
  });

  socket.on(
    "conversation-update-count",
    async ({ loggedInUserId }, callback) => {
      try {
        const convs = await DuoChat.find({ users: loggedInUserId });
        let count = 0;
        convs.forEach((conv) => {
          conv.conversation.forEach((msg) => {
            if (msg.read === false) {
              count += 1;
              return;
            }
          });
        });
        callback({ count });
      } catch (err) {
        console.log(err.message);
      }
    }
  );

  // socket.on("disconnect", async (userId) => {
  //   await User.findByIdAndUpdate(userId, { status: "offline" });
  // });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Handle the error, close connections, or do other cleanup
});
