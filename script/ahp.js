function generateTables() {
  const criteriaInput = document.getElementById("criteria").value;
  const alternativesInput = document.getElementById("alternatives").value;

  const criteria = criteriaInput.split(",").map((item) => item.trim());
  const alternatives = alternativesInput.split(",").map((item) => item.trim());

  const criteriaTable = document.getElementById("criteriaTable");
  criteriaTable.innerHTML = `<thead class="thead-dark"><tr><th>Kode</th><th>Nama</th></tr></thead><tbody>`;
  criteria.forEach((criterion, index) => {
    criteriaTable.innerHTML += `<tr><td>C${String(index + 1).padStart(2, "0")}</td><td>${criterion}</td></tr>`;
  });
  criteriaTable.innerHTML += `</tbody>`;

  const alternativeTable = document.getElementById("alternativeTable");
  alternativeTable.innerHTML = `<thead class="thead-dark"><tr><th>Kode</th><th>Nama</th></tr></thead><tbody>`;
  alternatives.forEach((alternative, index) => {
    alternativeTable.innerHTML += `<tr><td>A${String(index + 1).padStart(2, "0")}</td><td>${alternative}</td></tr>`;
  });
  alternativeTable.innerHTML += `</tbody>`;

  generatePairwiseTable(criteria.length, "pairwiseCriteriaContainer", "Kriteria");
  generatePairwiseTablesForAlternatives(criteria.length, alternatives.length);
}

function generatePairwiseTable(numItems, containerId, itemType) {
  const tableContainer = document.getElementById(containerId);
  const table = document.createElement("table");
  table.id = `${itemType.toLowerCase()}ComparisonTable`;
  table.className = "table table-bordered table-striped";

  let headerRow = "<thead class='thead-dark'><tr><th>" + itemType + "</th>";
  for (let i = 1; i <= numItems; i++) {
    headerRow += `<th>${itemType.charAt(0)}${i}</th>`;
  }
  headerRow += "</tr></thead><tbody>";
  table.innerHTML += headerRow;

  for (let i = 1; i <= numItems; i++) {
    let row = `<tr><th>${itemType.charAt(0)}${i}</th>`;
    for (let j = 1; j <= numItems; j++) {
      if (i === j) {
        row += "<td>1</td>";
      } else {
        row += `<td contenteditable="true" oninput="updateAutoValues(${i}, ${j}, '${itemType.toLowerCase()}ComparisonTable')"></td>`;
      }
    }
    row += "</tr>";
    table.innerHTML += row;
  }
  table.innerHTML += `</tbody>`;
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);
}

function generatePairwiseTablesForAlternatives(numCriteria, numAlternatives) {
  const container = document.getElementById("pairwiseAlternativesContainer");
  container.innerHTML = "";
  for (let i = 1; i <= numCriteria; i++) {
    const table = document.createElement("table");
    table.id = `alternativesComparisonTableC${i}`;
    table.className = "table table-bordered table-striped";

    let headerRow = `<thead class='thead-dark'><tr><th>Alternatif</th>`;
    for (let j = 1; j <= numAlternatives; j++) {
      headerRow += `<th>A${j}</th>`;
    }
    headerRow += "</tr></thead><tbody>";
    table.innerHTML += headerRow;

    for (let j = 1; j <= numAlternatives; j++) {
      let row = `<tr><th>A${j}</th>`;
      for (let k = 1; k <= numAlternatives; k++) {
        if (j === k) {
          row += "<td>1</td>";
        } else {
          row += `<td contenteditable="true" oninput="updateAutoValues(${j}, ${k}, 'alternativesComparisonTableC${i}')"></td>`;
        }
      }
      row += "</tr>";
      table.innerHTML += row;
    }
    table.innerHTML += `</tbody>`;

    const heading = document.createElement("h3");
    heading.textContent = `Tabel Perbandingan Alternatif untuk Kriteria C${i}`;
    container.appendChild(heading);
    container.appendChild(table);
  }
}

function updateAutoValues(row, col, tableId) {
  const table = document.getElementById(tableId);
  const value = table.rows[row].cells[col].innerText;

  if (value && value !== "1") {
    const reciprocalValue = (1 / value).toFixed(3);
    table.rows[col].cells[row].innerText = reciprocalValue;
  }
}

function calculateWeights() {
  const criteriaTable = document.getElementById("kriteriaComparisonTable");
  const criteriaValues = [];

  // Ambil nilai dari tabel perbandingan kriteria
  for (let i = 1; i < criteriaTable.rows.length; i++) {
    const rowValues = [];
    for (let j = 1; j < criteriaTable.rows[i].cells.length; j++) {
      const value = criteriaTable.rows[i].cells[j].innerText;
      rowValues.push(parseFloat(value));
    }
    criteriaValues.push(rowValues);
  }

  // Hitung bobot kriteria
  const criteriaWeights = calculateWeightsFromMatrix(criteriaValues);
  let resultText = "<div class='alert alert-info'>Bobot Kriteria:</div><ul>";
  for (let i = 0; i < criteriaWeights.length; i++) {
    resultText += `<li>C${i + 1}: ${criteriaWeights[i].toFixed(4)}</li>`;
  }
  resultText += "</ul>";

  const alternativesResults = [];
  const alternativeTables = document.querySelectorAll('[id^="alternativesComparisonTableC"]');
  const alternativeScores = Array(alternativeTables.length).fill(0);

  // Menghitung bobot alternatif untuk setiap kriteria
  alternativeTables.forEach((table, index) => {
    const alternativeValues = [];
    for (let i = 1; i < table.rows.length; i++) {
      const rowValues = [];
      for (let j = 1; j < table.rows[i].cells.length; j++) {
        const value = table.rows[i].cells[j].innerText;
        rowValues.push(parseFloat(value));
      }
      alternativeValues.push(rowValues);
    }

    // Hitung bobot alternatif
    const alternativeWeights = calculateWeightsFromMatrix(alternativeValues);
    alternativesResults.push(alternativeWeights);
    resultText += `<div class='alert alert-info mt-3'>Bobot Alternatif untuk Kriteria C${index + 1}:</div><table class='table table-bordered table-striped'><thead><tr><th>Alternatif</th><th>Bobot</th></tr></thead><tbody>`;
    for (let i = 0; i < alternativeWeights.length; i++) {
      resultText += `<tr><td>A${i + 1}</td><td>${alternativeWeights[i].toFixed(4)}</td></tr>`;
      // Menghitung skor total untuk setiap alternatif
      alternativeScores[i] += alternativeWeights[i] * criteriaWeights[index];
    }
    resultText += `</tbody></table>`;
  });

  // Buat tabel hasil skor dan peringkat
  const alternativeRankings = alternativeScores.map((score, index) => ({ alternative: `A${index + 1}`, score })).sort((a, b) => b.score - a.score); // Urutkan berdasarkan skor tertinggi

  // Hasil tabel
  let tableResult = `
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Alternatif</th>
          <th>Skor</th>
          <th>Rank</th>
        </tr>
      </thead>
      <tbody>`;

  // Tampilkan hasil hanya untuk alternatif yang sesuai dengan input
  const numAlternatives = document.getElementById("alternatives").value.split(",").length;
  alternativeRankings.slice(0, numAlternatives).forEach((item, index) => {
    tableResult += `
      <tr>
        <td>${item.alternative}</td>
        <td>${item.score.toFixed(4)}</td>
        <td>${index + 1}</td>
      </tr>`;
  });

  tableResult += `</tbody></table>`;

  const bestAlternativeIndex = alternativeScores.indexOf(Math.max(...alternativeScores));
  const bestAlternativeScore = alternativeScores[bestAlternativeIndex];

  // Menyusun hasil akhir
  conclusion = `<div class='alert alert-success mt-3'>Alternatif Terbaik: A${bestAlternativeIndex + 1} dengan skor ${bestAlternativeScore.toFixed(4)}.</div>`;
  conclusion += `<div>Alternatif ini dipilih karena memiliki skor tertinggi berdasarkan perbandingan yang dilakukan.</div>`;

  document.getElementById("result").innerHTML = resultText + tableResult + "<br>" + conclusion;
}

function calculateWeightsFromMatrix(matrix) {
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const columnSums = Array(numCols).fill(0);
  const weights = Array(numRows).fill(0);

  for (let j = 0; j < numCols; j++) {
    for (let i = 0; i < numRows; i++) {
      columnSums[j] += matrix[i][j];
    }
  }

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      weights[i] += matrix[i][j] / columnSums[j];
    }
    weights[i] /= numCols; // Normalisasi bobot
  }

  return weights;
}
