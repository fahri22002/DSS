function generateTables() {
  // Mengambil input kriteria dan alternatif dari elemen DOM
  const criteriaInput = document.getElementById("criteria").value;
  const alternativesInput = document.getElementById("alternatives").value;

  // Mendapatkan referensi tabel input
  const inputTable = document.getElementById("input-table");
  // Memisahkan dan membersihkan input kriteria dan alternatif
  const criteria = criteriaInput.split(",").map((item) => item.trim());
  const alternatives = alternativesInput.split(",").map((item) => item.trim());

  // Menghasilkan tabel kriteria
  const criteriaTable = document.getElementById("criteriaTable");
  criteriaTable.innerHTML = `<thead class="thead-dark"><tr><th>Kode</th><th>Nama</th></tr></thead><tbody>`;
  criteria.forEach((criterion, index) => {
    criteriaTable.innerHTML += `<tr><td class="text-center">C${String(index + 1).padStart(2, "0")}</td><td class="text-center">${criterion}</td></tr>`;
  });
  criteriaTable.innerHTML += `</tbody>`;

  // Menghasilkan tabel alternatif
  const alternativeTable = document.getElementById("alternativeTable");
  alternativeTable.innerHTML = `<thead class="thead-dark"><tr><th>Kode</th><th>Nama</th></tr></thead><tbody>`;
  alternatives.forEach((alternative, index) => {
    alternativeTable.innerHTML += `<tr><td class="text-center">A${String(index + 1).padStart(2, "0")}</td><td class="text-center">${alternative}</td></tr>`;
  });
  alternativeTable.innerHTML += `</tbody>`;

  // Menampilkan tabel input
  inputTable.classList.remove("hidden");

  // Menghasilkan tabel perbandingan kriteria
  generatePairwiseTable(criteria.length, "pairwiseCriteriaContainer", "Kriteria");
  // Menghasilkan tabel perbandingan alternatif untuk setiap kriteria
  generatePairwiseTablesForAlternatives(criteria.length, alternatives.length);
}

function generatePairwiseTable(numItems, containerId, itemType) {
  // Membuat tabel perbandingan pairwise untuk kriteria atau alternatif
  const tableContainer = document.getElementById(containerId);
  const table = document.createElement("table");
  table.id = `${itemType.toLowerCase()}ComparisonTable`;
  table.className = "table table-bordered table-striped text-center"; // Menambahkan kelas text-center

  // Menyiapkan header tabel
  let headerRow = "<thead class='thead-dark'><tr><th>" + itemType + "</th>";
  for (let i = 1; i <= numItems; i++) {
    headerRow += `<th>${itemType.charAt(0)}${i}</th>`;
  }
  headerRow += "</tr></thead><tbody>";
  table.innerHTML += headerRow;

  // Mengisi tabel dengan nilai perbandingan
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
  // Menghasilkan tabel perbandingan alternatif untuk setiap kriteria
  const container = document.getElementById("pairwiseAlternativesContainer");
  container.innerHTML = "";
  for (let i = 1; i <= numCriteria; i++) {
    const table = document.createElement("table");
    table.id = `alternativesComparisonTableC${i}`;
    table.className = "table table-bordered table-striped text-center"; // Menambahkan kelas text-center

    // Menyiapkan header tabel untuk alternatif
    let headerRow = `<thead class='thead-dark'><tr><th>Alternatif</th>`;
    for (let j = 1; j <= numAlternatives; j++) {
      headerRow += `<th>A${j}</th>`;
    }
    headerRow += "</tr></thead><tbody>";
    table.innerHTML += headerRow;

    // Mengisi tabel dengan nilai perbandingan alternatif
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

    // Menambahkan heading untuk tabel alternatif
    const heading = document.createElement("h3");
    heading.textContent = `Tabel Perbandingan Alternatif untuk Kriteria C${i}`;
    heading.className = "mt-4";
    container.appendChild(heading);
    container.appendChild(table);
  }
}

function updateAutoValues(row, col, tableId) {
  // Memperbarui nilai di sel yang bersesuaian dengan nilai yang diinput
  const table = document.getElementById(tableId);
  const value = table.rows[row].cells[col].innerText;

  if (value && value !== "1") {
    const reciprocalValue = (1 / value).toFixed(3);
    table.rows[col].cells[row].innerText = reciprocalValue;
  }
}

function calculateWeights() {
  // Mengambil tabel perbandingan kriteria dan nilai-nilai dari tabel tersebut
  const criteriaTable = document.getElementById("kriteriaComparisonTable");
  const criteriaValues = [];

  document.getElementById("result").classList.remove("hidden");
  // Ambil nilai-nilai dari tabel perbandingan kriteria
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
  let resultText = `<div class="alert alert-info">Bobot Kriteria:</div><ul>`;
  criteriaWeights.forEach((weight, i) => {
    resultText += `<li>C${i + 1}: ${weight.toFixed(4)}</li>`;
  });
  resultText += `</ul>`;

  const alternativeTables = document.querySelectorAll('[id^="alternativesComparisonTableC"]');
  const alternativeScores = Array(alternativeTables.length).fill(0);

  let alternativesResults = "";
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

    // Hitung bobot alternatif untuk masing-masing kriteria
    const alternativeWeights = calculateWeightsFromMatrix(alternativeValues);
    alternativesResults += `<div class="alert alert-warning mt-3">Bobot Alternatif untuk Kriteria C${index + 1}:</div><ul>`;
    alternativeWeights.forEach((weight, i) => {
      alternativesResults += `<li>A${i + 1}: ${weight.toFixed(4)}</li>`;
      alternativeScores[i] += weight * criteriaWeights[index];
    });
    alternativesResults += `</ul>`;
  });

  // Hitung ranking alternatif berdasarkan skor akhir
  const alternativeRankings = alternativeScores.map((score, index) => ({ alternative: `A${index + 1}`, score })).sort((a, b) => b.score - a.score);

  // Buat tabel hasil ranking
  let tableResult = `
    <table class="table table-bordered table-hover mt-4">
      <thead class="thead-dark">
        <tr><th>Alternatif</th><th>Skor</th><th>Rank</th></tr>
      </thead>
      <tbody>`;

  alternativeRankings.forEach((item, index) => {
    tableResult += `
      <tr>
        <td>${item.alternative}</td>
        <td>${item.score.toFixed(4)}</td>
        <td>${index + 1}</td>
      </tr>`;
  });

  tableResult += `</tbody></table>`;

  // Cari alternatif terbaik dan tampilkan setelah tabel ranking

  // Gabungkan hasil bobot, bobot alternatif, dan hasil ranking
  const bestAlternative = alternativeRankings[0];
  let conclusion = `
    <div class="alert alert-success mt-3">Alternatif Terbaik: ${bestAlternative.alternative} dengan skor ${bestAlternative.score.toFixed(4)}.<br> 
    Alasan: Alternatif ini memiliki skor tertinggi berdasarkan perbandingan kriteria dan alternatif</div>`;
  // document.getElementById("result").innerHTML = tableResult + resultText + alternativesResults;
  document.getElementById("result").innerHTML = resultText + tableResult + conclusion;
}

function calculateWeightsFromMatrix(matrix) {
  // Menghitung bobot dari matriks
  const numItems = matrix.length;
  const weights = Array(numItems).fill(0);

  for (let j = 0; j < numItems; j++) {
    let columnSum = 0;
    for (let i = 0; i < numItems; i++) {
      columnSum += matrix[i][j];
    }
    for (let i = 0; i < numItems; i++) {
      weights[j] += matrix[i][j] / columnSum;
    }
    weights[j] /= numItems;
  }
  return weights;
}
