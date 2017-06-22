$(function() {

	//d3 chart
        var margin = { top: 10, right: 30, bottom: 70, left: 70 };
          var width = 700 - margin.left - margin.right;
          var height = 600 - margin.top - margin.bottom;

          var svg = d3
            .select(".chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(responsivefy)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

            let opts = $('#opts-hidden').val()
            let pollId = $('#poll-id').val();
             
             d3.json(`http://localhost:3000/chart?id=${pollId}`, function(err, data){
              console.log(data);

              if(data){

              const extent = d3.extent(data, function(d){
              
                return d.votes
              });

                console.log('dd',extent)
            
         

              const yScale = d3.scaleLinear()
              .domain([0,extent[1]])
              .range([height, 0]);

              const xScale = d3.scaleBand().range([0, width]).padding(0.1)
              .domain(data.map(function(d) { return d.answer; }));;

                  //add y-axis
              svg.append("g").call(d3.axisLeft(yScale).ticks(5))
                 .style('font-size', '20');

                  //add x-axis
                svg
                  .append("g")
                  .attr("transform", `translate(0,${height})`)
                  .call(d3.axisBottom(xScale).ticks(10))
                  .style('font-size', '20');

                svg
                    .selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {
                      return xScale(d.answer);
                    })
                    .attr("y", function(d) {

                      return yScale(d.votes);
                    })
                    .attr("width", xScale.bandwidth())
                    .attr("height", function(d) {
                      return height - yScale(d.votes);
                    })

                    .style("fill", "lavender");
             }
    
              });
         


            function responsivefy(svg) {
              // get container + svg aspect ratio
              var container = d3.select(svg.node().parentNode),
                width = parseInt(svg.style("width")),
                height = parseInt(svg.style("height")),
                aspect = width / height;

              svg
                .attr("viewBox", "0 0 " + width + " " + height)
                .attr("preserveAspectRatio", "xMinYMid")
                .call(resize);
              d3.select(window).on("resize." + container.attr("id"), resize);

              function resize() {
                var targetWidth = parseInt(container.style("width"));
                svg.attr("width", targetWidth);
                svg.attr("height", Math.round(targetWidth / aspect));
              }
            }

})