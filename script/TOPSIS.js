function generateTable() {
    // Ambil jumlah baris (alternatif) dan kolom (kriteria) dari input pengguna
    const rows = document.getElementById('rows').value;
    const columns = document.getElementById('columns').value;
    const tableContainer = document.getElementById('table-container');
    const weightContainer = document.getElementById('weight-container');
    
    // Membuat HTML untuk tabel dan menambahkan judul kolom untuk alternatif
    let tableHTML = '<table><tr><th>Alternatives</th>';
    
    // Membuat header kolom dengan radio button untuk memilih benefit/cost
    for (let i = 1; i <= columns; i++) {
        tableHTML += `<th>C${i}<br>
        <input type="radio" name="criteria${i}" value="benefit" checked> Benefit
        <input type="radio" name="criteria${i}" value="cost"> Cost
        </th>`;
    }
    tableHTML += '</tr>';
    
    // Membuat baris untuk alternatif, masing-masing dengan input angka
    for (let i = 1; i <= rows; i++) {
        tableHTML += `<tr><td>Alternative ${i}</td>`;
        for (let j = 1; j <= columns; j++) {
            tableHTML += `<td><input type="number" id="cell-${i}-${j}" step="any"></td>`;
        }
        tableHTML += '</tr>';
    }
    tableHTML += '</table>';
    
    // Tambahkan tabel yang sudah dibuat ke dalam container di HTML
    tableContainer.innerHTML = tableHTML;

    // Membuat HTML untuk input bobot setiap kriteria
    let weightHTML = '<h4>Masukkan Bobot untuk Setiap Kriteria</h4><table><tr>';
    for (let i = 1; i <= columns; i++) {
        weightHTML += `<th>Bobot C${i}</th>`;
    }
    weightHTML += '</tr><tr>';
    for (let i = 1; i <= columns; i++) {
        weightHTML += `<td><input type="number" id="weight-${i}" step="any"></td>`;
    }
    weightHTML += '</tr></table>';

    // Tambahkan tombol untuk melakukan perhitungan TOPSIS
    weightHTML += '<br><button onclick="calculateTOPSIS()">Hitung</button>';
    
    // Tambahkan HTML bobot ke dalam container
    weightContainer.innerHTML = weightHTML;
}

function calculateTOPSIS() {
    // Mengambil jumlah baris (alternatif) dan kolom (kriteria)
    const rows = document.getElementById('rows').value;
    const columns = document.getElementById('columns').value;
    let decisionMatrix = [];
    let criteriaTypes = [];
    let weights = [];

    // Mengambil nilai input matriks keputusan dari tabel
    for (let i = 1; i <= rows; i++) {
        let rowValues = [];
        for (let j = 1; j <= columns; j++) {
            let cellValue = parseFloat(document.getElementById(`cell-${i}-${j}`).value);
            rowValues.push(cellValue);
        }
        decisionMatrix.push(rowValues);
    }

    // Mengambil jenis kriteria (benefit/cost) dari radio button
    for (let j = 1; j <= columns; j++) {
        let criteriaType = document.querySelector(`input[name="criteria${j}"]:checked`).value;
        criteriaTypes.push(criteriaType);
    }

    // Mengambil nilai bobot yang dimasukkan oleh pengguna
    for (let j = 1; j <= columns; j++) {
        let weightValue = parseFloat(document.getElementById(`weight-${j}`).value);
        weights.push(weightValue);
    }

    // Mulai melakukan perhitungan TOPSIS
    let resultContainer = document.getElementById('result-container');
    let outputHTML = '<h3>Hasil Perhitungan TOPSIS</h3>';

    // Normalisasi matriks keputusan
    let normalizedMatrix = normalizeMatrix(decisionMatrix, rows, columns);
    outputHTML += '<h4>Matriks Keputusan yang Dinormalisasi:</h4>' + generateMatrixHTML(normalizedMatrix, 'Alternative', 'Criteria');

    // Hitung matriks keputusan berbobot dengan menggunakan bobot yang diberikan
    let weightedMatrix = applyWeights(normalizedMatrix, weights);
    outputHTML += '<h4>Matriks Keputusan Berbobot:</h4>' + generateMatrixHTML(weightedMatrix, 'Alternative', 'Criteria');

    // Hitung solusi ideal positif dan negatif
    let { idealPositive, idealNegative } = calculateIdealSolutions(weightedMatrix, criteriaTypes);
    
    // Solusi Ideal Positif (A+)
    outputHTML += '<h4>Solusi Ideal Positif:</h4>' + generateIdealSolutionHTML(idealPositive, 'A+', 'Criteria');
    
    // Solusi Ideal Negatif (A-)
    outputHTML += '<h4>Solusi Ideal Negatif:</h4>' + generateIdealSolutionHTML(idealNegative, 'A-', 'Criteria');

    // Hitung jarak pemisahan (separation measures)
    let separationMeasures = calculateSeparationMeasures(weightedMatrix, idealPositive, idealNegative);
    outputHTML += '<h4>Jarak Pemisahan:</h4>' + generateMatrixHTML(separationMeasures, 'Alternative', ['D+', 'D-']);

    // Hitung nilai preferensi dan rangking alternatif
    let preferenceValues = calculatePreferenceValues(separationMeasures, rows);
    outputHTML += '<h4>Nilai Preferensi dan Peringkat:</h4>' + generatePreferenceHTML(preferenceValues);

    // Tentukan alternatif terbaik
    let bestAlternative = findBestAlternative(preferenceValues);
    outputHTML += `<h4>Kesimpulan:</h4><p>Alternatif terbaik adalah <strong>${bestAlternative}</strong> berdasarkan nilai preferensi tertinggi.</p>`;

    // Tampilkan hasil dalam container
    resultContainer.innerHTML = outputHTML;
}

// Fungsi baru untuk solusi ideal positif/negatif
function generateIdealSolutionHTML(solution, rowLabel, colLabel) {
    let html = '<table class="table table-bordered"><tr><th>Alternative</th>';
    
    // Membuat header kolom berdasarkan jumlah kriteria
    for (let i = 1; i <= solution.length; i++) {
        html += `<th>${colLabel} ${i}</th>`;
    }

    html += '</tr>';
    
    // Baris tunggal untuk solusi ideal dengan label A+ atau A-
    html += `<tr><td>${rowLabel}</td>`;
    solution.forEach(value => {
        html += `<td>${value.toFixed(4)}</td>`;
    });
    html += '</tr>';
    
    html += '</table>';
    return html;
}



function normalizeMatrix(matrix, rows, columns) {
    // Normalisasi matriks dengan menghitung akar kuadrat dari jumlah kuadrat setiap kolom
    let normalizedMatrix = [];
    for (let j = 0; j < columns; j++) {
        let columnSum = 0;
        for (let i = 0; i < rows; i++) {
            columnSum += matrix[i][j] ** 2;
        }
        let normFactor = Math.sqrt(columnSum);
        let normalizedColumn = matrix.map(row => row[j] / normFactor);
        for (let i = 0; i < rows; i++) {
            if (!normalizedMatrix[i]) normalizedMatrix[i] = [];
            normalizedMatrix[i][j] = normalizedColumn[i];
        }
    }
    return normalizedMatrix;
}

function applyWeights(matrix, weights) {
    // Menerapkan bobot ke matriks keputusan yang sudah dinormalisasi
    return matrix.map(row => row.map((value, index) => value * weights[index]));
}

function calculateIdealSolutions(matrix, criteriaTypes) {
    // Menghitung solusi ideal positif dan negatif untuk setiap kriteria
    let idealPositive = [];
    let idealNegative = [];
    
    for (let j = 0; j < matrix[0].length; j++) {
        let columnValues = matrix.map(row => row[j]);
        if (criteriaTypes[j] === 'benefit') {
            idealPositive.push(Math.max(...columnValues));
            idealNegative.push(Math.min(...columnValues));
        } else {
            idealPositive.push(Math.min(...columnValues));
            idealNegative.push(Math.max(...columnValues));
        }
    }
    return { idealPositive, idealNegative };
}

function calculateSeparationMeasures(matrix, idealPositive, idealNegative) {
    // Menghitung jarak pemisahan antara solusi ideal positif dan negatif
    return matrix.map(row => {
        let positiveDistance = Math.sqrt(row.reduce((sum, value, index) => sum + (value - idealPositive[index]) ** 2, 0));
        let negativeDistance = Math.sqrt(row.reduce((sum, value, index) => sum + (value - idealNegative[index]) ** 2, 0));
        return [positiveDistance, negativeDistance];
    });
}

function calculatePreferenceValues(separationMeasures, rows) {
    // Menghitung nilai preferensi untuk setiap alternatif
    let preferenceValues = separationMeasures.map(([positive, negative], index) => {
        let preference = negative / (positive + negative);
        return { alternative: `Alternative ${index + 1}`, preference: preference };
    });

    // Mengurutkan alternatif berdasarkan nilai preferensi secara menurun dan menentukan peringkatnya
    preferenceValues.sort((a, b) => b.preference - a.preference);
    preferenceValues.forEach((value, index) => value.rank = index + 1);

    return preferenceValues;
}

function findBestAlternative(preferenceValues) {
    // Menemukan alternatif terbaik berdasarkan nilai preferensi tertinggi
    return preferenceValues[0].alternative;
}

function generateMatrixHTML(matrix, rowLabel, colLabel) {
    // Membuat HTML untuk menampilkan tabel matriks
    let html = '<table class="table table-bordered"><tr>';
    
    // Jika ada label baris, tambahkan header untuk baris (alternatif)
    if (rowLabel) html += `<th>${rowLabel}</th>`;
    
    // Jika colLabel adalah array, gunakan elemen array sebagai header kolom
    if (Array.isArray(colLabel)) {
        colLabel.forEach(label => {
            html += `<th>${label}</th>`;
        });
    } else {
        // Jika colLabel adalah string, buat kolom header berdasarkan jumlah kolom matrix
        for (let i = 1; i <= matrix[0].length; i++) {
            html += `<th>${colLabel} ${i}</th>`;
        }
    }
    
    html += '</tr>';
    
    // Tampilkan setiap baris data matriks
    matrix.forEach((row, rowIndex) => {
        html += `<tr><td>Alternative ${rowIndex + 1}</td>`;
        row.forEach(value => {
            html += `<td>${value.toFixed(4)}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</table>';
    return html;
}

function generatePreferenceHTML(preferenceValues) {
    // Membuat HTML untuk menampilkan tabel nilai preferensi dan peringkat alternatif
    let html = '<table><tr><th>Alternatif</th><th>Nilai Preferensi</th><th>Peringkat</th></tr>';
    preferenceValues.forEach(value => {
        html += `<tr><td>${value.alternative}</td><td>${value.preference.toFixed(4)}</td><td>${value.rank}</td></tr>`;
    });
    html += '</table>';
    return html;
}
