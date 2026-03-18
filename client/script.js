const API_URL = "https://clipdrop-lio8.onrender.com";

async function pasteText() {

    const text = document.getElementById("text").value;

    const res = await fetch(API_URL + "/paste", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ text })

    });

    const data = await res.json();

    const code = data.code;

    const link = window.location.origin + "/get.html?code=" + code;
    document.getElementById("result").innerHTML =
    `
    <p class="text-green-400 text-lg">Code: <b>${code}</b></p>

    <button onclick="copyCode('${code}')"
    class="mt-2 bg-blue-500 px-4 py-2 rounded-lg">
    Copy Code
    </button>

    <p class="mt-4 text-gray-400">Share Link</p>

    <a href="${link}" class="text-blue-400 break-all">${link}</a>
    `;

    generateQR(link);
}

function generateQR(link){

    const canvas = document.getElementById("qrcode");

    QRCode.toCanvas(canvas, link, function (error) {

        if (error) console.error(error);

    });

}

async function getText(){

    const code = document.getElementById("code").value;

    console.log("Fetching code:", code);

    const res = await fetch(API_URL + "/get/" + code);

    console.log("Response status:", res.status);

    const data = await res.json();

    console.log("Response data:", data);

    if(data.message){
        alert(data.message);
        return;
    }

    if(data.text.includes("/uploads/")){
        alert("This is a file. Use file page.");
        return;
    }

    document.getElementById("output").value = data.text;

}

const dropArea = document.getElementById("dropArea");

dropArea.addEventListener("click", () => {
    document.getElementById("fileInput").click();
});

dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    document.getElementById("fileInput").files = e.dataTransfer.files;
});

function copyText(){

    const text = document.getElementById("output");

    text.select();

    document.execCommand("copy");

    alert("Text copied!");

}

function copyCode(code){

    navigator.clipboard.writeText(code);

    alert("Code copied!");

}



async function uploadFile(){

    const file = document.getElementById("fileInput").files[0];

    if(!file){
        alert("Select a file first!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    formData.append("password", document.getElementById("password").value);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", API_URL + "/upload", true);

    // progress bar
    xhr.upload.onprogress = function(e){
        if(e.lengthComputable){
            const percent = Math.round((e.loaded / e.total) * 100);

            document.getElementById("progressBar").style.width = percent + "%";
            document.getElementById("progressText").innerText = percent + "% uploading...";
        }
    };

    xhr.onload = function(){

    const data = JSON.parse(xhr.responseText);

    const code = data.code;

    const link = window.location.origin + "/getfile.html?code=" + code;

    document.getElementById("result").innerHTML = `
    <p class="text-green-400">File uploaded!</p>
    <p>Code: <b>${code}</b></p>
    <a href="${link}" class="text-blue-400">${link}</a>
    `;
};

    xhr.send(formData);
}

async function updateText(){

    const text = document.getElementById("text").value;

    // get code from result section
    const codeElement = document.querySelector("#result b");

    if(!codeElement){
        alert("Generate a code first!");
        return;
    }

    const code = codeElement.innerText;

    const res = await fetch(API_URL + "/update/" + code, {
        method: "PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({ text })
    });

    const data = await res.json();

    alert(data.message);

}

(function(){

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if(!code) return;

    // wait until page fully loads
    setTimeout(() => {

        const input = document.getElementById("code");

        if(input){
            input.value = code;

            console.log("Auto fetching:", code); // DEBUG

            getText();
        }

    }, 500);

})();