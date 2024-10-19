const messageInput=document.querySelector(".message-input");
const chatBody=document.querySelector(".chat-body");
const sendMessageButton=document.querySelector("#send-message");
const fileInput=document.querySelector("#file-input");
const fileUploadWrapper=document.querySelector(".file-upload-wrapper");
const chatbotToggler=document.querySelector(".chatbot-toggler");
const closeChatbot=document.querySelector(".down-button");

// API Setup
const API_KEY="AIzaSyC9jnuft_nnSHPeYGAxfHa8l61hmanAAsw";
const API_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData={
    message:null,
    file:{
        data:null,
        mime_type:null,
    }
}

const chatHistory=[];
const initialInputHeight=messageInput.scrollHeight;

// Create message element with dynamic classes and return it
const createMessageElement=(content,...classes)=>{
    const div=document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML=content;
    return div;
}

// Generat bot response using API
const generateBotResponse=async(incomingMessageDiv)=>{
    const messageElement=incomingMessageDiv.querySelector(".message-text");

    // Add user message to chat history
    chatHistory.push({
        role:"user",
        parts:[{text: userData.message}, ...(userData.file.data?[{inline_data:userData.file}]:[])]
      });

    // API request Options
    const requestOptions={
        method:"POST",
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify({
            contents: chatHistory,
        })
    }

    try{
        // Fetch bot response from API
        const response=await fetch(API_URL,requestOptions);
        const data=await response.json();
        if(!response.ok) throw new Error(data.error.message);

        // Extract and display bot's response text
        const apiResponseText=data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
        messageElement.innerText=apiResponseText;

        // Add bot response to chat history
        chatHistory.push({
            role:"model",
            parts:[{text: apiResponseText},]
          });
    }catch(error){
        // Handle Error in API request
        console.log(error);
        messageElement.innerText=error.message;
        messageElement.style.color="#ff0000";
    }finally{
        // Reset User's file data, removing  thinking indicator and scroll chat to bottom
        userData.file={};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({
            top:chatBody.scrollHeight,
            behaviour:"smooth"
        });
    }
}

// Handle Outgoing user Messages
const handleOutgoingMessage=(e)=>{
    e.preventDefault();
    userData.message=messageInput.value.trim();
    messageInput.value="";

    // Create and Display user message
    const messageContent=`<div class="message-text"></div>
                         ${userData.file.data ? `<img class="attachment" src="data:${userData.file.mime_type};base64,${userData.file.data}"/>`:""}`;
    const outgoingMessageDiv=createMessageElement(messageContent,"user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent=userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({
        top:chatBody.scrollHeight,
        behaviour:"smooth"
    });
    
    // Simulate Bot response with thinking indicator after a delay
    setTimeout(()=>{
        const messageContent=`<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                </svg>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`;
        const incomingMessageDiv=createMessageElement(messageContent,"bot-message","thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({
            top:chatBody.scrollHeight,
            behaviour:"smooth"
        });
        generateBotResponse(incomingMessageDiv);
    },600);
}

//Handle Enter Key press for sending Message
messageInput.addEventListener("keydown",(e)=>{
    // const userMessage=e.target.value.trim();
    if(e.key === "Enter"){
        handleOutgoingMessage(e);
    }
});

messageInput.addEventListener("input",()=>{
    messageInput.style.height=`${initialInputHeight}px`;
    messageInput.style.height=`${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius=messageInput.scrollHeight > initialInputHeight ? "15px" :"32px";
})

sendMessageButton.addEventListener("click",(e)=>handleOutgoingMessage(e));

// Handle file input change and preview the selected file
fileInput.addEventListener("change",()=>{
    const file=fileInput.files[0];
    if(!file){
        return;
    }

    const reader=new FileReader();
    reader.onload=(e)=>{
        fileUploadWrapper.querySelector("img").src=e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const base64String=e.target.result.split(",")[1];

        //Store File Data in User Data
        userData.file={
            data:base64String,
            mime_type:file.type,
        }

        fileInput.value="";
    }
    
    reader.readAsDataURL(file);
})

// Initialize Emoji Picker and Handle emoji selection
const picker=new EmojiMart.Picker({
    theme:"light",
    skinTonePosition:"none",
    previewPosition:"none",
    onEmojiSelect:(emoji)=>{
        const{selectionSort:start, selectionEnd:end}=messageInput;
        messageInput.setRangeText(emoji.native,start,end,"end");
        messageInput.focus();
    },
    onClickOutside:(e)=>{
        if(e.target.id === "emoji-picker"){
            document.querySelector("body").classList.toggle("show-emoji-picker");
        }else{
            // document.body.classList.remove("show-emoji-picker");
            document.querySelector("body").classList.remove("show-emoji-picker");
        }
    }
});

document.querySelector(".chat-form").appendChild(picker);

document.querySelector("#file-upload").addEventListener("click",() => fileInput.click());

// chatbotToggler.addEventListener("click",()=>document.body.classlist.toggle("show-chatbot"));
chatbotToggler.addEventListener("click",()=>
    document.querySelector(".chatbot-popup").classList.toggle("show-chatbot"));
    // chatbotToggler.classList.toggle("show-cancel")

chatbotToggler.addEventListener("click",()=>
    chatbotToggler.classList.toggle("show-cancel"));

closeChatbot.addEventListener("click",()=>document.querySelector(".chatbot-popup").classList.remove("show-chatbot"));
   