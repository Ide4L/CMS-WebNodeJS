document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('recordSelect');

    fetch('/getRecords')
        .then(response => response.json())
        .then(records => {
            records.forEach(record => {
                const option = document.createElement('option');
                option.value = record.id;
                option.textContent = `Record ${record.id}`;
                selectElement.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));
    // Listen for form submission
    document.getElementById('updateForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const selectedId = document.getElementById('recordSelect').value;
        const motorinfo = document.getElementById('motorinfo').value;
        const wheelinfo = document.getElementById('wheelinfo').value;
        // Add other fields as necessary

        // Send the update request
        fetch('/updateData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: selectedId,
                updatedMotorInfo: motorinfo,
                updatedWheelInfo: wheelinfo,
                // Include other fields as necessary
            }),
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Record updated successfully!');
            } else {
                alert('Failed to update record.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
