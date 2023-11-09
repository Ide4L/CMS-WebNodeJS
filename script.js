document.getElementById("editEntry").addEventListener("click", function () {
    const editProcessor = document.getElementById("editProcessor").value;
    const editRam = document.getElementById("editRam").value;
    const editSsd = document.getElementById("editSsd").value;
    const editGraphics = document.getElementById("editGraphics").value;
    const editPrice = document.getElementById("editPrice").value;

    fetch('/edit', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            processor: editProcessor,
            ram: editRam,
            ssd: editSsd,
            graphics: editGraphics,
            price: editPrice,
        }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            alert("Database entry updated successfully.");
            // You can optionally reload the page or update the UI here.
        } else {
            alert("Failed to update the database entry.");
        }
    })
    .catch((error) => {
        console.error("Error while updating the database entry: " + error.message);
    });
});
