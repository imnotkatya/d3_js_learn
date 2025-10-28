
 const width = 600;
  const height = 600;
  const marginTop = 30;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 70; 

const dataset = await FileAttachment("followup@17.json").json();

  const keys=["followUp","vemu","vemu_r","chemo"];
  const toParseColor = await FileAttachment("color.csv").csv(); 

  const colors = toParseColor.map(d => ({
    key: d.key,
    color: d.color,
    stroke_dash: +d.stroke_dash, 
    y_modify: +d.y_modify,  
    stroke: d.stroke,
    strokeWidth: +d['stroke-width']
  }));
    const color = d3.scaleOrdinal()
    .domain(colors.map(c => c.key))
    .range(colors.map(c => c.color));
  const svg = d3.create("svg")
    .attr("width", width)
    .attr('height', height);


  const y = d3.scaleBand()
    .domain(dataset.map(d => d.name)) 
    .paddingInner(0.2)
    .range([height - marginBottom, marginTop])
 

 const x = d3.scaleLinear()
    .domain([0, 50])
    .range([marginLeft, width -marginRight])
   ;

  svg.append("g")
    .attr("transform", `translate(0,${height -marginBottom})`)
    .call(d3.axisBottom(x).tickValues([0, 6, 12,18, 24,30,36,42,48]))
    ;

  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

 svg
      .selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('fill',d=>color(d.type))
  .attr("stroke","black")
     .attr('y', (d, i) => y(d.name)) 
      .attr('x', d=>x(d.start))
    .attr('height', y.bandwidth()) 
       .attr("width", d => Math.max(0, x(d.end) - x(d.start)));

svg.selectAll("legend_rect")
  .data(keys)
  .enter()
  .append("rect")
    .attr("x", 400)
    .attr("y", (d,i)=> 390 + i*25) 
    .attr("width", 20)
    .attr("height", 20)
  .attr("stroke","black")
   .style("fill", d=> color(d))
    .style("fill",d=> color(d))


svg.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
    .attr("x", 430)
    .attr("y", (d,i)=> 405 + i*25) 
    .style("fill", d=>  color(d))
    .text(d=>  d)



  
  return svg.node();
