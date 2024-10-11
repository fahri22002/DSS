
let inp = [];
let stat = [];
let r = [];
let w = [];
let v = [];

// Function to generate the matrix inputs based on criteria and alternatives
function generateTable() {
    const numKriteria = document.getElementById('numKriteria').value;
    const numAlternatif = document.getElementById('numAlternatif').value;
    const matrixInput = document.getElementById('matrixInput');
    const matrixOutput = document.getElementById('matrixOutput');

    matrixInput.innerHTML = ''; // Clear existing table

    // Initialize the arrays based on the number of alternatives and criteria
    inp = Array.from({ length: numAlternatif }, () => Array(numKriteria).fill(0));
    r = Array.from({ length: numAlternatif }, () => Array(numKriteria).fill(0));
    stat = Array.from({ length: numKriteria }, () => 0); // Initialize stat array for criteria
    w = Array.from({ length: numKriteria }, () => 0); // Initialize stat array for criteria
    v = Array.from({ length: numAlternatif }, () => 0); // Initialize stat array for criteria

    // Create header row for criteria
    const headerRow = document.createElement('tr');
    const emptyCell = document.createElement('th');
    headerRow.appendChild(emptyCell); // Empty top-left corner
    for (let j = 0; j < numKriteria; j++) {
        const headerCell = document.createElement('th');
        headerCell.textContent = `C${j+1}`;
        
        // Create a dropdown for each criterion to choose K or B
        const select = document.createElement('select');
        select.innerHTML = `
            <option value="0">K</option>
            <option value="1">B</option>
        `;
        select.onchange = function() {
            stat[j] = parseInt(select.value); // Update stat array based on selection
        };
        
        headerCell.appendChild(select);
        headerRow.appendChild(headerCell);
    }
    matrixInput.appendChild(headerRow);

    // Create input rows for alternatives
    for (let i = 0; i < numAlternatif; i++) {
        const row = document.createElement('tr');
        const rowHeader = document.createElement('th');
        rowHeader.textContent = `A${i+1}`; // Row header (alternative)
        row.appendChild(rowHeader);

        for (let j = 0; j < numKriteria; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `inp${i+1}${j+1}`;
            input.classList.add('matrix-cell');
            input.min = 0;
            input.placeholder = `A${i+1}C${j+1}`;
            cell.appendChild(input);
            row.appendChild(cell);
        }

        matrixInput.appendChild(row);
    }
    const row = document.createElement('tr');
    const rowHeader = document.createElement('th');
    rowHeader.textContent = `W`; // Row header (alternative)
    row.appendChild(rowHeader);
    for (let j = 0; j < numKriteria; j++) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `inpW${j+1}`;
        input.classList.add('matrix-cell');
        input.min = 0;
        input.placeholder = `W${j+1}`;
        cell.appendChild(input);
        row.appendChild(cell);
    }
    matrixInput.appendChild(row);
}

function getRankIndex(arr, value) {
    // Buat salinan dari array dan urutkan dari terbesar ke terkecil
    const sortedArr = [...arr].sort((a, b) => b - a);
    // Temukan indeks dari nilai dalam array yang sudah diurutkan
    return sortedArr.indexOf(value) + 1; // Tambahkan 1 untuk mendapatkan peringkat
}

// Function to save input values into the array
function saveInputToArray() {
    
    const numKriteria = document.getElementById('numKriteria').value;
    const numAlternatif = document.getElementById('numAlternatif').value;
    let maxC = Array.from({ length: numKriteria }, () => 0); // Initialize stat array for criteria
    let minC = Array.from({ length: numKriteria }, () => 999); // Initialize stat array for criteria
    for (let i = 0; i < numAlternatif; i++) {
        w[i]=0;
        for (let j = 0; j < numKriteria; j++) {
            const inputVal = document.getElementById(`inp${i+1}${j+1}`).value;
            const inputW = document.getElementById(`inpW${j+1}`).value;
            inp[i][j] = parseFloat(inputVal) || 0; // Save input value to the array, default to 0 if empty
            w[j] = parseFloat(inputW) || 0; // Save input value to the array, default to 0 if empty
            if (maxC[j]<inp[i][j]){
                maxC[j] = inp[i][j];
            }
            if (minC[j]>inp[i][j]){
                minC[j] = inp[i][j];
            }
        }
    }
    for (let i = 0; i < numAlternatif; i++) {
        for (let j = 0; j < numKriteria; j++) {
            if (stat[j]==0){
                r[i][j] = inp[i][j]/maxC[j];
            }else{
                r[i][j] = minC[j]/inp[i][j];
            }
            v[i] += w[j]*r[i][j]
        }
    }
    
    // Output the arrays to the screen
    // let outputText = `Input Array: ${JSON.stringify(v)}\n`;
    // outputText += `Stat Array: ${JSON.stringify(stat)}\n`;
    // outputText += `MaxC Array: ${JSON.stringify(maxC)}\n`;
    // outputText += `MinC Array: ${JSON.stringify(minC)}\n`;
    // outputText += `R Array: ${JSON.stringify(r)}\n`;
    // outputText += `W Array: ${JSON.stringify(w)}\n`;
    // outputText += `V Array: ${JSON.stringify(v)}\n`;

    // document.getElementById('output').textContent = outputText;
    document.getElementById('matrixOutput').innerHTML = '';

    // Create header row for criteria
    const headerRow = document.createElement('tr');
    const emptyCell = document.createElement('th');
    headerRow.appendChild(emptyCell); // Empty top-left corner
    for (let j = 0; j < numKriteria + 2; j++) {
        if (j < numKriteria) {
            const headerCell = document.createElement('th');
            headerCell.textContent = `C${j + 1}`; // Header C1, C2, ...
            headerRow.appendChild(headerCell);
        } else if (j == numKriteria) {
            const headerCell = document.createElement('th');
            headerCell.textContent = `V`; // Kolom untuk V
            headerRow.appendChild(headerCell);
        } else if (j == numKriteria + 1) {
            const headerCell = document.createElement('th');
            headerCell.textContent = `Rank`; // Kolom untuk Rank
            headerRow.appendChild(headerCell);
        }
    }

    matrixOutput.appendChild(headerRow);
    // Buat baris output di tabel output
    for (let i = 0; i < numAlternatif; i++) {
        const row = document.createElement('tr');
        const rowHeader = document.createElement('th');
        rowHeader.textContent = `A${i+1}`; // Header baris (alternatif)
        row.appendChild(rowHeader);

        for (let j = 0; j < numKriteria+2; j++) {
            if (j < numKriteria){
                const cell = document.createElement('td');
                const output = document.createElement('input'); // Gunakan input alih-alih output
                output.type = 'number';
                output.value = r[i][j]; // Set nilai
                output.readOnly = true; // Jadikan read-only
                cell.appendChild(output);
                row.appendChild(cell);
            } else if (j == numKriteria){
                const cell = document.createElement('td');
                const outputV = document.createElement('input'); // Gunakan input alih-alih output
                outputV.type = 'number';
                outputV.value = v[i]; // Set nilai
                outputV.readOnly = true; // Jadikan read-only
                cell.appendChild(outputV);
                row.appendChild(cell);
            } else if  (j == numKriteria + 1){
                const cell = document.createElement('td');
                const output = document.createElement('input'); // Gunakan input alih-alih output
                output.type = 'number';
                output.value = getRankIndex(v,v[i]); // Set nilai
                output.readOnly = true; // Jadikan read-only
                cell.appendChild(output);
                row.appendChild(cell);
            }
        }



        matrixOutput.appendChild(row);
    }
}

// Initial generation of table
window.onload = generateTable;