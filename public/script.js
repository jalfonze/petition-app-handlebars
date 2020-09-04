(function () {
    const canvas = document.querySelector("#signHere");
    // const ctx = canvas.getContext("2d");
    const backDrop = canvas.getContext("2d");
    const dataURL = canvas.toDataURL();
    let hiddenInput = document.getElementById("inputHidden");

    // console.log("hiddeninput Value: ", hiddenInputValue);
    console.log("hiddeninput Value new: ", hiddenInput.value);

    console.log("line 7 script: ", dataURL);

    canvas.addEventListener("mousemove", (e) => {
        hiddenInput.value = dataURL;
        // backDrop.beginPath();
        // backDrop.fillStyle = "rgb(185, 185, 185)";
        // backDrop.fillRect(0, 0, 250, 70);
        backDrop.lineWidth = 10;
        backDrop.lineTo(e.clientX, e.clientY);
        backDrop.stroke();
    });

    // canvas.addEventListener("mousemove", (e) => {});
})(); //iffe close
