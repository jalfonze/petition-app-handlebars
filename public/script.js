(function () {
    const canvas = document.querySelector("#signHere");
    const backDrop = canvas.getContext("2d");
    const ctx = canvas.getContext("2d");
    let hiddenInput = document.getElementById("inputHidden");
    const clear = document.querySelector(".clearButton");

    // console.log("hiddeninput Value: ", hiddenInputValue);
    console.log("hiddeninput Value new: ", hiddenInput.value);
    // console.log("line 7 script: ", dataURL);

    let signature = false;

    canvas.addEventListener("mousedown", () => {
        signature = true;
    });

    canvas.addEventListener("mouseup", () => {
        signature = false;
        const dataURL = canvas.toDataURL();
        console.log("dataUrl: ", dataURL);
        hiddenInput.value = dataURL;
        ctx.beginPath();
    });

    canvas.addEventListener("mouseenter", () => {
        ctx.beginPath();
    });

    canvas.addEventListener("mouseleave", () => {
        signature = false;
    });

    backDrop.beginPath();
    backDrop.fillStyle = "rgb(230, 227, 227)";
    backDrop.fillRect(0, 0, 400, 70);
    canvas.addEventListener("mousemove", (e) => {
        if (!signature) {
            return;
        }
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    });

    // canvas.addEventListener("mousemove", (e) => {});
})(); //iffe close
