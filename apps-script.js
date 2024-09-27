function onOpen() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.clear(); 
    
    const apiUrl = 'https://node-postgre-0euo.onrender.com/fetch_users';
    const response = UrlFetchApp.fetch(apiUrl);
    const jsonData = JSON.parse(response.getContentText());
    
    if (jsonData.length > 0) {
        const headers = Object.keys(jsonData[0]).filter(key => key !== 'id');
        sheet.appendRow(headers); 
    
        jsonData.forEach(record => {
            if (record.id !== -1) {
                const row = headers.map(header => record[header] || null); 
                const rowNum = record.id + 1;
                sheet.getRange(rowNum, 1, 1, headers.length).setValues([row]);
            }
        });
    
        const range = sheet.getRange(1, 1, 1, headers.length);
        range.setFontWeight("bold"); 
        const protection = range.protect().setDescription('Locked Headers');
        protection.removeEditors(protection.getEditors());
        if (protection.canDomainEdit()) {
            protection.setDomainEdit(false);
        }
    }
}

function onEdit(e) {
    const sheet = e.source.getActiveSheet();
    const range = e.range;

    const editedRow = range.getRow();
    const editedColumn = range.getColumn();
    const newValue = range.getValue(); 

    if (editedRow === 1) {
        return;
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const columnName = headers[editedColumn - 1];

    if (columnName && columnName !== 'id') {
        const rowId = editedRow - 1;
        
        const apiUrl = `https://node-postgre-0euo.onrender.com/update-user?id=${rowId}&columnname=${columnName}&newValue=${newValue}`;

        const options = {
            method: 'put',
            muteHttpExceptions: true 
        };

        try {
            const response = UrlFetchApp.fetch(apiUrl, options);
            const responseCode = response.getResponseCode();

            if (responseCode === 200) {
                Logger.log('User updated successfully');
            } else {
                Logger.log(`Failed to update user: ${response.getContentText()}`);
            }
        } catch (error) {
            Logger.log(`Error sending request: ${error.message}`);
        }
    }
}



