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

   const link = "https://clipdrop-liard.vercel.app/get.html?code=" + code;

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

    const res = await fetch(API_URL + "/get/" + code);

    const data = await res.json();

    document.getElementById("output").value = data.text;

}

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

window.onload = function(){

    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");

    if(code){

        document.getElementById("code").value = code;

        getText();

    }

};