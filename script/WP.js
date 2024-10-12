
let inp = [];
let stat = [];
let s = [];
let w = [];
let v = [];

function initiateValue(){
    // Pastikan numKriteria dan numAlternatif sudah valid
    numKriteria = parseInt(document.getElementById('numKriteria').value);
    numAlternatif = parseInt(document.getElementById('numAlternatif').value);

    // Cek apakah nilai valid, jika tidak, return untuk menghentikan inisialisasi yang salah
    if (isNaN(numKriteria) || isNaN(numAlternatif) || numKriteria <= 0 || numAlternatif <= 0) {
        console.error("Nilai numKriteria atau numAlternatif tidak valid!");
        return;
    }
    inp = Array.from({ length: numAlternatif }, () => Array(numKriteria).fill(0));
    stat = Array.from({ length: numKriteria }, () => 0); // Initialize stat array for criteria
    w = Array.from({ length: numKriteria }, () => 0); // Initialize stat array for criteria
    v = Array.from({ length: numAlternatif }, () => 0); // Initialize stat array for criteria
    s = Array.from({ length: numAlternatif }, () => 1); // Initialize stat array for criteria
}
// Function to generate the matrix inputs based on criteria and alternatives
function generateTable() {
    const matrixInput = document.getElementById('matrixInput');
    const matrixOutput = document.getElementById('matrixOutput');

    matrixInput.innerHTML = ''; // Clear existing table

    initiateValue()
    // Create header row for criteria
    const headerRow = document.createElement('tr');
    const emptyCell = document.createElement('th');
    headerRow.appendChild(emptyCell); // Empty top-left corner
    for (let j = 0; j < numKriteria; j++) {
        const headerCell = document.createElement('th');
        headerCell.textContent = `C${j+1}`;
        
        // Dropdown dropdown untuk setiap kriteria antara "Keuntungan" atau "Beban"
        const select = document.createElement('select'); // Buat elemen select
        select.id = `select${j + 1}`; // Set ID setelah elemen dibuat
        select.innerHTML = `
            <option value="0">Keuntungan</option>
            <option value="1">Biaya</option>
        `;
        
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
function normalizeW(){
    let sw = 0
    for (let j = 0; j < numKriteria; j++) {
        sw += w[j]
    }
    for (let j = 0; j < numKriteria; j++) {
        w[j] = w[j]/sw
    }
}
function calculate(){
    initiateValue()
    saveInputToArray()
    normalizeW()
    let sumS = 0
    s = Array.from({ length: numAlternatif }, () => 1); // Initialize stat array for criteria
    for (let i = 0; i < numAlternatif; i++) {
        for (let j = 0; j < numKriteria; j++) {
            let mul = (stat[j]==0)?1:-1
            if (inp[i][j]==0){
                s[i] = 0
                break
            }
            s[i] *= Math.pow(inp[i][j],mul*w[j])
        }
        sumS += s[i]
    }
    
    v = Array.from({ length: numAlternatif }, () => 0); // Initialize stat array for criteria
    for (let i = 0; i < numAlternatif; i++) {
        v[i] = s[i]/sumS
    }
    createMatrix()
}

function createMatrix(){
    document.getElementById('matrixOutput').innerHTML = '';

    // Create header row for criteria
    const headerRow = document.createElement('tr');
    const emptyCell = document.createElement('th');
    headerRow.appendChild(emptyCell); // Empty top-left corner
    const headerCell = document.createElement('th');
    headerCell.textContent = `S`; // Header C1, C2, ...
    headerRow.appendChild(headerCell);
    headerCellV = document.createElement('th');
    headerCellV.textContent = `V`; // Header C1, C2, ...
    headerRow.appendChild(headerCellV);
    headerCellRank = document.createElement('th');
    headerCellRank.textContent = `Rank`; // Header C1, C2, ...
    headerRow.appendChild(headerCellRank);
    matrixOutput.appendChild(headerRow);
    // Buat baris output di tabel output
    for (let i = 0; i < numAlternatif; i++) {
        const row = document.createElement('tr');
        const rowHeader = document.createElement('th');
        rowHeader.textContent = `A${i+1}`; // Header baris (alternatif)
        row.appendChild(rowHeader);

        for (let j = 0; j < 3; j++) {
            if (j == 0){
                const cell = document.createElement('td');
                const output = document.createElement('input'); // Gunakan input alih-alih output
                output.type = 'number';
                output.value = s[i]; // Set nilai
                output.readOnly = true; // Jadikan read-only
                cell.appendChild(output);
                row.appendChild(cell);
            } else if (j == 1){
                const cell = document.createElement('td');
                const outputV = document.createElement('input'); // Gunakan input alih-alih output
                outputV.type = 'number';
                outputV.value = v[i]; // Set nilai
                outputV.readOnly = true; // Jadikan read-only
                cell.appendChild(outputV);
                row.appendChild(cell);
            } else if  (j == 2){
                const cell = document.createElement('td');
                const output = document.createElement('input'); // Gunakan input alih-alih output
                output.type = 'number';
                let rank = getRankIndex(v,v[i])
                output.value = rank; // Set nilai
                output.readOnly = true; // Jadikan read-only
                cell.appendChild(output);
                row.appendChild(cell);
                if (rank == 1){
                    document.getElementById('conclusion').textContent = `Berdasarkan hasil perhitungan diatas, maka alternatif terbaik yang dapat dipilih adalah : \nAlternatif A${i+1}`;

                }
            }
        }



        matrixOutput.appendChild(row);
    }
}
// Function to save input values into the array
function saveInputToArray() {
    const numKriteria = document.getElementById('numKriteria').value;
    const numAlternatif = document.getElementById('numAlternatif').value;
    for (let i = 0; i < numAlternatif; i++) {
        w[i]=0;
        for (let j = 0; j < numKriteria; j++) {
            const inputVal = document.getElementById(`inp${i+1}${j+1}`).value;
            const inputW = document.getElementById(`inpW${j+1}`).value;
            inp[i][j] = parseFloat(inputVal) || 0; // Save input value to the array, default to 0 if empty
            w[j] = parseFloat(inputW) || 0; // Save input value to the array, default to 0 if empty
            // Ambil nilai dari dropdown yang sudah ada
            const select = document.getElementById(`select${j + 1}`);
            if (select) {
                stat[j] = parseInt(select.value); // Ambil nilai dari dropdown
            }
        }
    }
    
    
    
}

// Initial generation of table
window.onload = generateTable;