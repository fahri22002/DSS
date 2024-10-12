function generateTable() {
    const rows = document.getElementById('rows').value;
    const columns = document.getElementById('columns').value;
    const tableContainer = document.getElementById('table-container');
    const weightContainer = document.getElementById('weight-container');
    
    let tableHTML = '<table><tr><th>Alternatives</th>';
    
    // Create column headers with radio buttons for benefit/cost
    for (let i = 1; i <= columns; i++) {
        tableHTML += `<th>C${i}<br>
        <input type="radio" name="criteria${i}" value="benefit" checked> Benefit
        <input type="radio" name="criteria${i}" value="cost"> Cost
        </th>`;
    }
    tableHTML += '</tr>';
    
    // Create rows for alternatives
    for (let i = 1; i <= rows; i++) {
        tableHTML += `<tr><td>Alternative ${i}</td>`;
        for (let j = 1; j <= columns; j++) {
            tableHTML += `<td><input type="number" id="cell-${i}-${j}" step="any"></td>`;
        }
        tableHTML += '</tr>';
    }
    tableHTML += '</table>';
    
    // Add the table to the container
    tableContainer.innerHTML = tableHTML;

    // Add a section for user to input the weights for each criterion
    let weightHTML = '<h4>Enter Weights for Each Criterion</h4><table><tr>';
    for (let i = 1; i <= columns; i++) {
        weightHTML += `<th>C${i} Weight</th>`;
    }
    weightHTML += '</tr><tr>';
    for (let i = 1; i <= columns; i++) {
        weightHTML += `<td><input type="number" id="weight-${i}" step="any"></td>`;
    }
    weightHTML += '</tr></table>';

    // Add a button to calculate TOPSIS
    weightHTML += '<br><button onclick="calculateTOPSIS()">Calculate TOPSIS</button>';
    
    weightContainer.innerHTML = weightHTML;
}

function calculateTOPSIS() {
    const rows = document.getElementById('rows').value;
    const columns = document.getElementById('columns').value;
    let decisionMatrix = [];
    let criteriaTypes = [];
    let weights = [];

    // Fetch the decision matrix input values
    for (let i = 1; i <= rows; i++) {
        let rowValues = [];
        for (let j = 1; j <= columns; j++) {
            let cellValue = parseFloat(document.getElementById(`cell-${i}-${j}`).value);
            rowValues.push(cellValue);
        }
        decisionMatrix.push(rowValues);
    }

    // Fetch the criteria types (benefit/cost)
    for (let j = 1; j <= columns; j++) {
        let criteriaType = document.querySelector(`input[name="criteria${j}"]:checked`).value;
        criteriaTypes.push(criteriaType);
    }

    // Fetch the weights entered by the user
    for (let j = 1; j <= columns; j++) {
        let weightValue = parseFloat(document.getElementById(`weight-${j}`).value);
        weights.push(weightValue);
    }

    // Now, perform the TOPSIS calculation
    let resultContainer = document.getElementById('result-container');
    let outputHTML = '<h3>TOPSIS Calculation Results</h3>';

    // Normalize the decision matrix
    let normalizedMatrix = normalizeMatrix(decisionMatrix, rows, columns);
    outputHTML += '<h4>Normalized Decision Matrix:</h4>' + generateMatrixHTML(normalizedMatrix, 'Alternative', 'Criteria');

    // Calculate the weighted normalized decision matrix using the provided weights
    let weightedMatrix = applyWeights(normalizedMatrix, weights);
    outputHTML += '<h4>Weighted Normalized Decision Matrix:</h4>' + generateMatrixHTML(weightedMatrix, 'Alternative', 'Criteria');

    // Calculate the ideal positive and negative solutions
    let { idealPositive, idealNegative } = calculateIdealSolutions(weightedMatrix, criteriaTypes);
    outputHTML += '<h4>Ideal Positive Solutions:</h4>' + generateMatrixHTML([idealPositive], '', 'Criteria');
    outputHTML += '<h4>Ideal Negative Solutions:</h4>' + generateMatrixHTML([idealNegative], '', 'Criteria');

    // Calculate the separation measures
    let separationMeasures = calculateSeparationMeasures(weightedMatrix, idealPositive, idealNegative);
    outputHTML += '<h4>Separation Measures:</h4>' + generateMatrixHTML(separationMeasures, 'Alternative', ['D+','D-']);

    // Calculate the preference values and rank the alternatives
    let preferenceValues = calculatePreferenceValues(separationMeasures, rows);
    outputHTML += '<h4>Preference Values and Rankings:</h4>' + generatePreferenceHTML(preferenceValues);

    // Identify the best alternative
    let bestAlternative = findBestAlternative(preferenceValues);
    outputHTML += `<h4>Conclusion:</h4><p>The best alternative is <strong>${bestAlternative}</strong> based on the highest preference value.</p>`;

    resultContainer.innerHTML = outputHTML;
}

function normalizeMatrix(matrix, rows, columns) {
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
    return matrix.map(row => row.map((value, index) => value * weights[index]));
}

function calculateIdealSolutions(matrix, criteriaTypes) {
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
    return matrix.map(row => {
        let positiveDistance = Math.sqrt(row.reduce((sum, value, index) => sum + (value - idealPositive[index]) ** 2, 0));
        let negativeDistance = Math.sqrt(row.reduce((sum, value, index) => sum + (value - idealNegative[index]) ** 2, 0));
        return [positiveDistance, negativeDistance];
    });
}

function calculatePreferenceValues(separationMeasures, rows) {
    let preferenceValues = separationMeasures.map(([positive, negative], index) => {
        let preference = negative / (positive + negative);
        return { alternative: `Alternative ${index + 1}`, preference: preference };
    });

    // Sort alternatives by preference value in descending order and assign ranks
    preferenceValues.sort((a, b) => b.preference - a.preference);
    preferenceValues.forEach((value, index) => value.rank = index + 1);

    return preferenceValues;
}

function findBestAlternative(preferenceValues) {
    return preferenceValues[0].alternative;
}

function generateMatrixHTML(matrix, rowLabel, colLabel) {
    let html = '<table class="table table-bordered"><tr>';
    
    // Jika rowLabel diberikan, tambahkan header untuk baris (alternatif)
    if (rowLabel) html += `<th>${rowLabel}</th>`;
    
    // Periksa apakah colLabel adalah array atau string
    if (Array.isArray(colLabel)) {
        colLabel.forEach(label => {
            html += `<th>${label}</th>`;
        });
    } else {
        // Jika colLabel bukan array, buat kolom header berdasarkan jumlah kolom matrix
        for (let i = 1; i <= matrix[0].length; i++) {
            html += `<th>${colLabel} ${i}</th>`;
        }
    }
    
    html += '</tr>';
    
    // Tampilkan data matrix
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
    let html = '<table><tr><th>Alternative</th><th>Preference Value</th><th>Rank</th></tr>';
    preferenceValues.forEach(value => {
        html += `<tr><td>${value.alternative}</td><td>${value.preference.toFixed(4)}</td><td>${value.rank}</td></tr>`;
    });
    html += '</table>';
    return html;
}
