let selectedFile = null;
const API_URL = "https://clipdrop-lio8.onrender.com";

const fileInput = document.getElementById("fileInput");
const fileNameText = document.getElementById("fileName");

// 🔥 NEW ADDITION (PUT HERE)
const fileInfo = document.getElementById("fileInfo");
const imagePreview = document.getElementById("imagePreview");
const pdfPreview = document.getElementById("pdfPreview");
const previewContainer = document.getElementById("previewContainer");

function showFileDetails(file){

    const sizeKB = (file.size / 1024).toFixed(2);

    if(fileInfo){
        fileInfo.classList.remove("hidden");
        fileInfo.innerText = `Type: ${file.type} | Size: ${sizeKB} KB`;
    }

    if(previewContainer){
        previewContainer.classList.remove("hidden");
    }

    // IMAGE
    if(file.type.startsWith("image/")){
        const url = URL.createObjectURL(file);
        imagePreview.src = url;
        imagePreview.classList.remove("hidden");
        pdfPreview.classList.add("hidden");
    }

    // PDF
    else if(file.type === "application/pdf"){
        const url = URL.createObjectURL(file);
        pdfPreview.src = url;
        pdfPreview.classList.remove("hidden");
        imagePreview.classList.add("hidden");
    }

    else{
        imagePreview.classList.add("hidden");
        pdfPreview.classList.add("hidden");
    }
}

if(fileInput){
    fileInput.addEventListener("change", () => {
        if(fileInput.files.length > 0){
            selectedFile = fileInput.files[0];   // ✅ store file
            fileNameText.innerText = selectedFile.name;
            showFileDetails(selectedFile);
        }
    });
}

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

if(dropArea){

    dropArea.addEventListener("click", () => {
        fileInput.click();
    });

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.classList.add("border-purple-400");
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("border-purple-400");
    });

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("border-purple-400");

    const files = e.dataTransfer.files;

    if(files.length > 0){
        selectedFile = files[0];   // ✅ store file
        fileNameText.innerText = selectedFile.name;
        showFileDetails(selectedFile);
    }
});
}

function copyCode(code){

    navigator.clipboard.writeText(code);

    alert("Code copied!");

}



async function uploadFile(){

    const file = selectedFile;

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

        const bar = document.getElementById("progressBar");
        bar.style.width = percent + "%";

        bar.style.transition = "width 0.3s ease";   // 🔥 smooth

        document.getElementById("progressText").innerText =
        percent + "% uploading...";
    }
};

    xhr.onload = function(){

    const data = JSON.parse(xhr.responseText);

    const code = data.code;

    const link = window.location.origin + "/getfile.html?code=" + code;
    document.getElementById("progressText").innerText = "✅ Upload Complete!";

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

document.addEventListener("DOMContentLoaded", function(){

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    console.log("URL code:", code); // DEBUG

    if(!code) return;

    setTimeout(() => {

        const input = document.querySelector("#code");

        console.log("Input found:", input); // DEBUG

        if(input){
            input.value = code;

            console.log("Auto fetching now...");

            getText();
        }

    }, 500);

});
// ✅ Auto-fill code from URL
window.addEventListener("load", function(){

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if(code){
        const input = document.getElementById("code");

        if(input){
            input.value = code;   // ✅ fills input box

            // OPTIONAL: auto fetch text also
            getText();
        }
    }

});