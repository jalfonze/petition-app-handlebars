(function () {
    const canvas = document.querySelector("#signHere");
    const backDrop = canvas.getContext("2d");
    const ctx = canvas.getContext("2d");
    let hiddenInput = document.getElementById("inputHidden");
    // let left = canvas.offsetLeft;
    // let top = canvas.offsetTop;

    // console.log("hiddeninput Value: ", hiddenInputValue);
    console.log("hiddeninput Value new: ", hiddenInput.value);
    // console.log("line 7 script: ", dataURL);
    backDrop.beginPath();
    backDrop.fillStyle = "rgb(230, 227, 227)";
    backDrop.fillRect(0, 0, 400, 70);

    let signature = false;

    canvas.addEventListener("mouseenter", () => {
        ctx.beginPath();
    });

    canvas.addEventListener("mouseleave", () => {
        signature = false;
    });

    canvas.addEventListener("mousedown", (e) => {
        signature = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener("mouseup", () => {
        signature = false;
        const dataURL = canvas.toDataURL();
        console.log("dataUrl: ", dataURL);
        hiddenInput.value = dataURL;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!signature) {
            return;
        }
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    });

    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        signature = true;
        let touchX = e.touches[0].clientX;
        let touchY = e.touches[0].clientY;
        ctx.beginPath();
        ctx.moveTo(
            touchX - canvas.getBoundingClientRect().left,
            touchY - canvas.getBoundingClientRect().top
        );
        console.log(touchX, touchY);
    });

    canvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        signature = false;
        const dataURL = canvas.toDataURL();
        console.log("dataUrl: ", dataURL);
        hiddenInput.value = dataURL;
    });

    canvas.addEventListener("touchmove", (e) => {
        if (!signature) {
            return;
        }

        let touchX = e.touches[0].clientX;
        let touchY = e.touches[0].clientY;
        console.log(touchX, touchY);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineTo(
            touchX - canvas.getBoundingClientRect().left,
            touchY - canvas.getBoundingClientRect().top
        );
        ctx.stroke();
    });
})(); //iffe close
