(function () {
    const canvas = document.querySelector("#signHere");
    // const ctx = canvas.getContext("2d");
    const ctx = canvas.getContext("2d");

    let left = canvas.offsetLeft;
    let top = canvas.offsetTop;
    let hiddenInput = document.getElementById("inputHidden");

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

    window.addEventListener("resize", (e) => {
        e.clientX - left;
        e.clientY - top;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!signature) {
            return;
        }
        // backDrop.beginPath();
        // backDrop.fillStyle = "rgb(185, 185, 185)";
        // backDrop.fillRect(0, 0, 250, 70);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineTo(e.clientX - left, e.clientY - top);
        ctx.stroke();
    });

    // canvas.addEventListener("mousemove", (e) => {});
})(); //iffe close
