$(document).ready(function() {
    $('#paymentDefaultersTable').DataTable();
    $('#feesCollectedTable').DataTable();
    $('#feestoCollectTable').DataTable();
    $('#resultStatisticsTable').DataTable();
    $('#studentResultsTable').DataTable();
    $('#studentCountByClassTable').DataTable();
    $('#studentCountByPositionTable').DataTable();
    const gradesData = {
      labels: ['Fail', 'A+', 'A', 'B+'],
      datasets: [{
          data: [10, 25, 30, 15], // Update these values with your actual data
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF', '#FFA500'], // Colors for each segment
      }],
  };

  // Get the canvas element
  const canvas = document.getElementById('gradeChart');
  const ctx = canvas.getContext('2d');

  // Set the desired size for the canvas through CSS
  canvas.style.width = '150px'; // You can adjust this value
  canvas.style.height = '150px'; 

  const gradePieChart = new Chart(ctx, {
      type: 'pie',
      data: gradesData,
      options: {
          title: {
              display: true,
              text: 'Grade Distribution',
              fontSize: 18,
          },
          legend: {
              display: true,
              position: 'bottom',
          },
      },
  });
});