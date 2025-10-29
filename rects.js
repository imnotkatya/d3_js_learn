  const width = 600;
  const height = 800;
  const marginTop = 30;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 120; 

function convertWideToLong(dataset) {
  const result =  [];
  
  dataset.forEach(patient => {
    const patientVisualData = [];
 
    Object.entries(patient).forEach(([field, value]) => {
      if (field.endsWith('___start')) {
        const type = field.replace('___start', '');
        const startValue = +value;
        const endField = field.replace('___start', '___end');
        const endValue = patient[endField] ? +patient[endField] : startValue;
        
        patientVisualData.push({
          name: patient.name,
          ro: patient.ro,
          type: type,
          start: startValue,
          end: endValue,
        
        });
      }
      else if (field.endsWith('___event')) {
        const type = field.replace('___event', '');
        const eventValue = +value;
        
        patientVisualData.push({
          name: patient.name,
          ro: patient.ro,
          type: type,
          start: eventValue,
          end: eventValue,
        });
      }
     
    });
    
    result.push(...patientVisualData);
   
  });
  
  return result;
}



  const dataset = await FileAttachment("followup-2@1.csv").csv(); 
  const toParseColor = await FileAttachment("styles.csv").csv(); 

  const colors = toParseColor.map(d => ({
    key: d.key,
    color: d.color,
    stroke_dash: +d.stroke_dash, 
    y_modify: +d.y_modify,  
    stroke: d.stroke,
    symbol:d.symbol,
    symbol_size:+d.symbol_size,
    strokeWidth: +d['stroke-width']
  }));

  const parsedDataset = dataset.map(d => ({
    name: d.name,
    ro: d.ro,
    start: +d.start, 
    end: +d.end,  
    type: d.type,
    r: +d.r,
    face: +d.face,
    direction: +d.direction,
  }));

const dataset_Long = await FileAttachment("followUp_long_excel@2.csv").csv();
const parsedDataset_long = convertWideToLong(dataset_Long);
console.log("Structured:", parsedDataset_long);
  
  const datagrouped = d3.group(parsedDataset_long, (d) => d.name);
  const sortedData = Array.from(datagrouped)
    .sort((a, b) => {
      const aAvg = d3.max(a[1].map(d => d.end));
      const bAvg = d3.max(b[1].map(d => d.end));
      return aAvg - bAvg;
    })
    .flatMap(([id, types]) => types);

  const svg = d3.create("svg")
    .attr("width", width)
    .attr('height', height);

  const uniqueNames = [...new Set(sortedData.map(d => d.name))];
  const y = d3.scaleBand()
    .domain(uniqueNames) 
    .paddingInner(0.2)
    .range([height - marginBottom, marginTop]);

  
  svg.selectAll("column")
    .data(uniqueNames)
    .enter()
    .append("text")
    .attr("x", marginLeft - 70)
    .attr("y", d => y(d) + y.bandwidth() / 2)
    .attr("dy", "4px")
    .text(d => {
      const patient = sortedData.find(p => p.name === d);
      return patient.ro;
    })
    .style("font-size", "12px");

  const x = d3.scaleLinear()
    .domain([0, 50])
    .range([marginLeft, width - marginRight]);
  
  const color = d3.scaleOrdinal()
    .domain(colors.map(c => c.key))
    .range(colors.map(c => c.color));

  const stroke_color = d3.scaleOrdinal()
    .domain(colors.map(c => c.key))
    .range(colors.map(c => c.stroke));

  const stroke_dash = d3.scaleOrdinal()
    .domain(colors.map(c => c.key))
    .range(colors.map(c => c.stroke_dash));

  const stroke_width = d3.scaleOrdinal()
    .domain(colors.map(c => c.key))
    .range(colors.map(c => c.strokeWidth));
  
  const y_modified = d3.scaleOrdinal()
    .domain(colors.map(c => c.key))
    .range(colors.map(c => c.y_modify));
  
  const symbols = d3.scaleOrdinal()
    .domain(colors.map(c => c.key))
    .range(colors.map(c => c.symbol));
    
  const symbol_size = d3.scaleOrdinal()
    .domain(colors.map(c => c.key))
    .range(colors.map(c => c.symbol_size));
 
 
  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickValues([0, 6, 12, 18, 24, 30, 36, 42, 48]));

  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

  
  const elements = svg.selectAll("data")
    .data(sortedData)
    .enter()
    .append("g")
    .attr("stroke-dasharray", d => stroke_dash(d.type))
    .attr("fill", d => color(d.type))
    .attr("stroke", d => stroke_color(d.type))
    .attr("opacity", d => d.start >= 0 ? 1 : 0)
    .attr("stroke-width", d => stroke_width(d.type));
 
elements
    .append("rect")
    .attr("y", d => y(d.name) + y_modified(d.type)) 
    .attr("x", d => x(d.start))
    .attr("height", y.bandwidth()) 
    .attr("width", d => Math.max(0, x(d.end) - x(d.start)));
 
elements
  .append("text")
  .attr("x", d => x(d.start))
  .attr("y", d => y(d.name) + y.bandwidth() / 2 + y_modified(d.type)) 
   .style("font-size",d=>symbol_size(d.type))
  .text(d => symbols(d.type)); 



colors.map(c => c.key).forEach((key, i) => {
    const symbol = symbols(key); 
    if (symbol) {
        svg.append("text")
            .attr("x", width - 90)
            .attr("y",  height/2 + 105 + i * 25)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "16px")
            .text(symbol)
            .style("fill", color(key))
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);
    } else {
        svg.append("rect")
            .attr("class", "legend_rect")
            .attr("x", width - 100)
            .attr("y",  height/2 + 90 + i * 25 )
            .attr("width", 20)
            .attr("height", 20)
            .attr("stroke", "black")
            .style("fill", color(key));
    }
});
  
  svg.selectAll("legend_labels")
    .data(colors.map(c => c.key))
    .enter()
    .append("text")
    .attr("x", width - 170)
    .attr("y", (d, i) => height - 295 + i * 25) 
    .style("fill", 'black')
    .text(d => d);

  return svg.node();