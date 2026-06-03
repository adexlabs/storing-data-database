let currentConversation = null;

const messages =
    document.getElementById("messages");

const conversationList =
    document.getElementById("conversationList");

const input =
    document.getElementById("messageInput");

input.addEventListener(
    "keypress",
    function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            sendMessage();

        }

    }
);

async function createConversation() {

    const res =
        await fetch("/api/conversation", {
            method: "POST"
        });

    const data =
        await res.json();

    currentConversation =
        data.id;

    loadConversations();

    messages.innerHTML = "";
}

document
    .getElementById("newChat")
    .onclick = createConversation;

async function loadConversations() {

    const res =
        await fetch("/api/conversations");

    const chats =
        await res.json();

    conversationList.innerHTML = "";

    chats.forEach(chat => {

        const div =
            document.createElement("div");

        div.className = "chat-item";

        div.innerText =
            chat.title;

        div.onclick = () => {

            currentConversation =
                chat.id;

            loadMessages(chat.id);
        };

        conversationList.appendChild(div);

    });
}

async function loadMessages(id) {

    const res =
        await fetch(`/api/messages?id=${id}`);

    const data =
        await res.json();

    messages.innerHTML = "";

    data.forEach(msg => {

        addMessage(
            msg.content,
            msg.role
        );

    });

}

function addMessage(text, role) {

    const div =
        document.createElement("div");

    div.className =
        `message ${role}`;

    div.innerText = text;

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;
}

document
    .getElementById("sendBtn")
    .onclick = sendMessage;

async function sendMessage() {

    const input =
        document.getElementById("messageInput");

    const text =
        input.value.trim();

    if (!text) return;

    addMessage(text, "user");

    input.value = "";

    const res =
        await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                conversationId:
                    currentConversation,

                message: text

            })
        });

    const data =
        await res.json();

    addMessage(
        data.reply,
        "assistant"
    );

    loadConversations();
}

loadConversations();
createConversation();