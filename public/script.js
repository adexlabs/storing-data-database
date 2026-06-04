
let userId = localStorage.getItem("adex_user_id") || null;

let currentConversation = null;

const messages =
    document.getElementById("messages");

const conversationList =
    document.getElementById("conversationList");

const input =
    document.getElementById("messageInput");

//
// USER MANAGEMENT
//
async function getOrCreateUser() {

    userId =
        localStorage.getItem("adex_user_id");

    if (userId) return;

    userId =
        "ADEX-" + Date.now();

    localStorage.setItem(
        "adex_user_id",
        userId
    );

    await fetch(
        "/api/register-user",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                userId
            })
        }
    );
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
async function createConversation(title = "New Chat") {

    try {

        const res = await fetch(
            "/api/conversation",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title,
                    userId
                })
            }
        );

        const data = await res.json();

        console.log(
            "Conversation Response:",
            data
        );

        if (!data.id) {

            console.error(
                "Conversation ID not returned"
            );

            return null;
        }

        currentConversation =
            data.id;

        loadConversations();

        return data.id;

    } catch (err) {

        console.error(
            "Create Conversation Error:",
            err
        );

        return null;
    }
}
document
    .getElementById("newChat")
    .onclick = async () => {

        messages.innerHTML = "";

        currentConversation = null;

        localStorage.removeItem(
            "currentConversation"
        );
    };

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
                `/api/messages?id=${id}&userId=${userId}`
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

        currentConversation =
            await createConversation(text);

        if (!currentConversation) {

            addMessage(
                "Failed to create conversation",
                "assistant"
            );

            return;
        }
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

    console.log({
        currentConversation,
        userId,
        text
    });

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

        console.error(err);

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