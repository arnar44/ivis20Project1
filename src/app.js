import * as d3 from 'd3';
import ParCoords from 'parcoord-es';

const titles = [  'Alias','Major', 'Information Visualization', 'Statistics', 'Mathematics', 
                  'Drawing and artistic', 'Computer usage', 
                  'Programming', 'Computer graphics programming',
                  'Human-computer interaction programming', 'UX evaluation',
                  'Communication', 'Collaboration',
                  'Code repository'];

(async function () {
  // Load Data for IVIS20 Project 1
  let dataset = await d3.csv('/data/datap1Clean.csv');

  // Make parallel coordinates graph
  let pc = makeParCoords(dataset);

  // Make data table below coordinates graph
  let table = makeTableHead();
  makeTableRows(table, dataset);
  
  // Event listener for 'clear' button - Clear filter/brush
  d3.select('#btn-clear').on('click', function(){
    pc.brushReset();
  })
  

}) ();

function makeParCoords(data) {
  let colorgen = d3.scaleOrdinal()
    .domain(data)
    .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
            "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
            "#cab2d6","#6a3d9a","#ffff99","#b15928"]);

  let pc = ParCoords()("#draft")
  .data(data)
  .hideAxis(['Timestamp','Alias','Interest and hobbies'])
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
    let table = d3.select('table');
    makeTableRows(table, brushed);
  });

  return pc;
}

function makeTableHead() {  
  let sortAscending = true;
  let table = d3.select('#page-wrap').append('table');
  let headers = table.append('thead').append('tr')
                .selectAll('th')
                .data(titles).enter()
                .append('th')
                .text(function(d){
                  return d;
                })
                .on('click', function(d){
                  headers.attr('class', 'header');
                  let rows = d3.select('tbody').selectAll('tr');
                     
                  if (sortAscending) {
                    rows.sort(function(a, b) { 
                      if (a[d] < b[d]) { 
                        return 1; 
                      } else if (a[d] > b[d]) { 
                        return -1; 
                      } else {
                        return 0;
                      }
                    });
                    sortAscending = false;
                    this.className = 'aes';
                  } else {
                    rows.sort(function(a, b) {
                      if (a[d] < b[d]) { 
                        return -1; 
                      } else if (a[d] > b[d]) { 
                        return 1; 
                      } else {
                        return 0;
                      }
                    });
                    sortAscending = true;
                    this.className = 'des';
                  }
                  
                });

  return table;
}

function makeTableRows(table, data) {

  let rows = table.append('tbody').selectAll('tr')
  .data(data).enter()
  .append('tr');
   rows.selectAll('td')
     .data(function (d) {
       return titles.map(function (k) {
         return { 'value': d[k], 'name': k};
       });
     }).enter()
     .append('td')
     .attr('data-th', function (d) {
       return d.name;
     })
     .text(function (d) {
       return d.value;
     })
    
}