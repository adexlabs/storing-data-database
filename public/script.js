let currentConversation = null;

const messages =
  document.getElementById("messages");

const conversationList =
  document.getElementById("conversationList");

const input =
  document.getElementById("messageInput");

let userId = null;

//
// USER MANAGEMENT
//
async function getOrCreateUser() {

  userId = localStorage.getItem("adex_user_id");

  if (userId) {
    console.log("Existing User:", userId);
    return;
  }

  try {

    const res =
      await fetch("/api/user", {
        method: "POST"
      });

    const data =
      await res.json();

    userId = data.userId;

    localStorage.setItem(
      "adex_user_id",
      userId
    );

    console.log(
      "New User Created:",
      userId
    );

  } catch (err) {

    console.error(
      "User Creation Error",
      err
    );

  }
}

//
// ENTER KEY
//
input.addEventListener(
  "keypress",
  function (e) {

    if (e.key === "Enter") {

      e.preventDefault();

      sendMessage();

    }

  }
);

//
// CREATE CONVERSATION
//
async function createConversation() {

  try {

    const res =
      await fetch("/api/conversation", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          userId
        })

      });

    const data =
      await res.json();

    currentConversation =
      data.id;

    loadConversations();

    messages.innerHTML = "";

  } catch (err) {

    console.error(err);

  }

}

document
  .getElementById("newChat")
  .onclick = createConversation;

//
// LOAD CONVERSATIONS
//
async function loadConversations() {

  try {

    const res =
      await fetch(
        `/api/conversations?userId=${userId}`
      );

    const chats =
      await res.json();

    conversationList.innerHTML = "";

    if (!Array.isArray(chats))
      return;

    chats.forEach(chat => {

      const div =
        document.createElement("div");

      div.className =
        "chat-item";

      div.innerText =
        chat.title ||
        "New Chat";

      div.onclick = () => {

        currentConversation =
          chat.id;

        localStorage.setItem(
          "currentConversation",
          chat.id
        );

        loadMessages(chat.id);

      };

      conversationList.appendChild(div);

    });

  } catch (err) {

    console.error(err);

  }

}

//
// LOAD MESSAGES
//
async function loadMessages(id) {

  try {

    const res =
      await fetch(
        `/api/messages?id=${id}`
      );

    const data =
      await res.json();

    messages.innerHTML = "";

    if (!Array.isArray(data))
      return;

    data.forEach(msg => {

      addMessage(
        msg.content,
        msg.role
      );

    });

  } catch (err) {

    console.error(err);

  }

}

//
// ADD MESSAGE
//
function addMessage(
  text,
  role
) {

  const div =
    document.createElement("div");

  div.className =
    `message ${role}`;

  div.innerText =
    text;

  messages.appendChild(div);

  messages.scrollTop =
    messages.scrollHeight;

}

//
// SEND MESSAGE
//
document
  .getElementById("sendBtn")
  .onclick = sendMessage;

async function sendMessage() {

  const text =
    input.value.trim();

  if (!text) return;

  if (!currentConversation) {

    await createConversation();

  }

  addMessage(
    text,
    "user"
  );

  input.value = "";

  const loader =
    document.createElement("div");

  loader.className =
    "message assistant loader";

  loader.innerHTML =
    "<span></span><span></span><span></span>";

  messages.appendChild(loader);

  try {

    const res =
      await fetch(
        "/api/chat",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            conversationId:
              currentConversation,

            userId,

            message: text

          })

        }
      );

    const data =
      await res.json();

    loader.remove();

    addMessage(
      data.reply ||
      data.error,
      "assistant"
    );

    loadConversations();

  } catch (err) {

    loader.remove();

    addMessage(
      "Server Error",
      "assistant"
    );

  }

}

//
// APP START
//
async function init() {

  await getOrCreateUser();

  await loadConversations();

  const savedConversation =
    localStorage.getItem(
      "currentConversation"
    );

  if (savedConversation) {

    currentConversation =
      savedConversation;

    loadMessages(
      savedConversation
    );

  }

}

init();