import * as d3 from 'd3';
import ParCoords from 'parcoord-es';

const titles = [  'Alias','Major', 'Information Visualization', 'Statistics', 'Mathematics', 
                  'Drawing and artistic', 'Computer usage', 
                  'Programming', 'Computer graphics programming',
                  'Human-computer interaction programming', 'UX evaluation',
                  'Communication', 'Collaboration',
                  'Code repository'];

const shortTitles = [   'Alias','Major', 'IV', 'Stats', 'Math', 
                        'D&A', 'CP use','CODE', 'CP graph',
                        'HM-CP INT', 'UX eval',
                        'CommUni', 'Collab','Repo'];

const groupTitles = [ 'Group1','Group2','Group3','Group4','Group5','Group6',
                      'Group7','Group8','Group9','Group10','Group11','Group12'];

let groups = {"Group1": [],"Group2": [],"Group3": [],"Group4": [],"Group5": [],"Group6": [],
              "Group7": [],"Group8": [],"Group9": [],"Group10": [],"Group11": [],"Group12": []};

let originalData;
let stateData;
let table;
let clickedRow;
let modal;

window.addEventListener('DOMContentLoaded', async (event) => {
  originalData = await d3.csv('/data/datap2Clean.csv');
  stateData = [...originalData]; // Data on display
  
  // Make head of data table that shows what the parallel coordinates shows
  makeTableHead();

  // Show data
  init(stateData);

  // Create Modal that pops up when student is selected
  makeModal();

  // Create containers for groups
  makeGroupRows();

  // Add event listeners for buttons
  makeEventListeners();
  
});

function init(data) {
  // Show Parallel Coordinates
  makeParCoords(data);
  // Add the data to the table
  makeTableRows(data);
}

function makeParCoords(data) {
  let colorgen = d3.scaleOrdinal()
    .domain(data)
    .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
            "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
            "#cab2d6","#6a3d9a","#ffff99","#b15928"]);  

  d3.select('#draft').html("");
  
  let pc = ParCoords()("#draft").data(data)
    .hideAxis(['Timestamp','Alias','Major Full','Interest and hobbies'])
    .color(function(d) {
		  return colorgen(d.Alias);
	    })
    .alpha(0.25)
    .margin({ top: 24, left: 100, bottom: 12, right: 0 })
    .mode("queue")
    .commonScale() // Sets the scale for all values 1-10
    .render()
    .brushMode("1D-axes")  // enable brushing
    .on('brushend', function(brushed) { // update table with parcoord brush
      let double = document.querySelectorAll('tbody');
      if(double.length > 0) {
        double[0].remove();
      }
      let t = d3.select('table');
      makeTableRows(brushed);
    });  
}

function makeTableHead() {  
  let sortAscending = true;
  table = d3.select('#page-wrap').append('table').attr('class', 'dataTable');
  let headers = table.append('thead').append('tr')
                .selectAll('th')
                .data(shortTitles).enter()
                .append('th')
                .text((d) => {
                  return d;
                })
                .attr('class', 'header')
                .on('click', function(d) {
                  headers.attr('class', 'header');
                  let rows = d3.select('tbody').selectAll('tr');
                  
                  if (sortAscending) {
                    rows.sort( (a, b) => { 
                      let comp1 = isNaN(a[d]) ? a[d] < b[d] : +a[d] < +b[d];
                      let comp2 = isNaN(a[d]) ? a[d] > b[d] : +a[d] > +b[d];
                      if (comp1) { 
                        return 1; 
                      } else if (comp2) { 
                        return -1; 
                      } else {
                        return 0;
                      }
                    });
                    sortAscending = false;
                    this.className = 'aes';
                  } else {
                    rows.sort( (a, b) => {
                      let comp1 = isNaN(a[d]) ? a[d] < b[d] : +a[d] < +b[d];
                      let comp2 = isNaN(a[d]) ? a[d] > b[d] : +a[d] > +b[d];
                      if (comp1) { 
                        return -1; 
                      } else if (comp2) { 
                        return 1; 
                      } else {
                        return 0;
                      }
                    });
                    sortAscending = true;
                    this.className = 'des';
                  }     
                });

      d3.selectAll('th')
          .append('span')
          .data(titles)
          .text( (d) => {
            return d;
          })
          .attr('class', 'tooltiptext');
}

function makeTableRows(data) {

  d3.select('#dataTableBody').remove();

  let rows = table.append('tbody').attr('id', 'dataTableBody').selectAll('tr')
  .data(data).enter()
  .append('tr');

  
  rows.selectAll('td')
     .data( (d) => {
       return shortTitles.map((k) => {
         return { 'value': d[k], 'name': k};
       });
     }).enter()
     .append('td')
     .attr('data-th', (d) => {
       return d.name;
     })
     .text((d) => {
       return d.value;
     })
     .on('click', function () {
        // Save what row was clicked
        clickedRow = this;
        // Display modal
        modal.style.display = "block";
        // Add additional information about student
        let container = d3.select('.addInfo');
        let index = stateData.findIndex(x => x.Alias === this.parentNode.firstChild.textContent);
        
        // Hobbies
        container.insert('span', ':first-child').text(stateData[index]['Interest and hobbies']);
        container.insert('p', ':first-child').attr('class','modalText').text('Interests and hobbies:');
        // Full major
        container.insert('span', ':first-child').text(stateData[index]['Major Full']);
        container.insert('p', ':first-child').attr('class','modalText').text('Full Major Information:');
        // Heading
        container.insert('h5', ':first-child').text('Additional Information:');

     });
     
}

function makeModal() {
  modal = document.getElementById("myModal");
  const container = d3.select('.modal-content');

  

  // Groups that can be picked in modal for student
  container.append('select')
    .attr('id', 'modalSelect')
    .attr('class', 'custom-select')
    .selectAll('option')
    .data(groupTitles).enter()
    .append('option')
    .text(function (d) {
      return d;
    })
    .attr('value', function (d) {
      return d;
    });
  
  // Set first option as selected
  d3.select('option').attr('selected', 'selected');

  // Add a confirm button
  container.append('button')
    .attr('class', 'modalButton')
    .attr('type', 'button')
    .text('Add')
    .on('click', () => {
      // Get the "group" selected from drop down
      let group = document.getElementById('modalSelect').value;
    
      // Get clicked student and index of student in data
      let id = clickedRow.parentNode.firstChild.textContent;
      let index = stateData.findIndex(x => x.Alias === id);

      if (index !== undefined) {
        // Student selected from table
        let student = stateData[index]; 
        // Remove from data being visualized in state
        stateData.splice(index, 1); 
        // Re-draw parcoords with student removed and table
        init(stateData)
        // Add student to group
        groups[group].push(student);
        makeGroupRows();
      } 

      // Clear additional info from modal
      d3.select('.addInfo').html("");
    
      // Remove modal from screen
      modal.style.display = "none";
    });

  // Add a cancel button
  container.append('button')
    .attr('class', 'modalButton')
    .attr('type', 'button')
    .text('Cancel')
    .on('click', () => {
      modal.style.display = "none";
      // Clear additional info from modal
      d3.select('.addInfo').html("");
    });
 
  // X button in corner for modal
  document.getElementsByClassName("close")[0]
    .addEventListener('click', () => {
      modal.style.display = 'none';
      // clear additional info from modal
      d3.select('.addInfo').html("");
    }); 
}

function makeGroupRows() {

  Object.keys(groups).forEach(g => {
    let result = `<table><thead><tr><th>${g}</th></tr></thead><tbody>`;
    for (let i=0; i<6; i++) {
        let txt = groups[g][i] ? groups[g][i].Alias : '';   
        result += `<tr><td>${txt}</td></tr>`;  
    }
    result += '</tbody>';
  
    let div = document.getElementById(`${g}`);
    div.innerHTML = result;
  });
}

function makeEventListeners() {
    // Event listener for 'clear' button - Clear filter/brush
    d3.select('#btn-clear').on('click', function(){
      //pc.brushReset(); // Dont need if we remake the canvas with new data
      init(stateData)
    });

    // Event Listener for 'Clear grouos', empties groups and puts data in original state
    d3.select('#btn-refresh').on('click', function() {
      // Empty Groups
      Object.keys(groups).forEach(g => {
        groups[g] = [];
      });
      
      // Get the data back
      stateData = [...originalData]; // Data on display
      // Display
      makeGroupRows();
      init(stateData);
    });
}
