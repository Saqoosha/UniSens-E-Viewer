import React, { useState, useEffect, useCallback } from "react"
import { useDropzone } from 'react-dropzone'
import Chart from "react-apexcharts"
import * as Papa from "papaparse"


export default props => {
  const [options, setOptions] = useState({
    chart: {
      id: "basic-bar",
      zoom: {
        enabled: false
      },
    },
    title: {
      align: "center"
    },
    stroke: {
      width: [2, 1]
    },
    xaxis: {
      type: 'numeric',
      tickAmount: 10,
      min: 0,
      max: 100,
      title: {
        text: 'Time (seconds)',
        offsetY: -10
      }
    },
    yaxis: {
      min: 0,
      max: 2500,
      tickAmount: 5,
      decimalsInFloat: 0,
    },
    annotations: {
      yaxis: [{
        y: 1800,
        borderColor: "#ff0000",
        label: {
          borderColor: "#ff0000",
          style: {
            color: "#fff",
            background: "#ff0000"
          },
          text: "1800W"
        }
      }]
    },
    tooltip: {
      x: {
        show: true,
        formatter: value => value
      }
    }
  })

  const [series, setSeries] = useState([])

  const onLoadComplete = ({ data, errors, meta }) => {
    data.shift() // skip header
    // console.log(data[1], errors[0], meta)
    let wattage = data.map(d => [d[3], d[8] || 0])
    let average = wattage.map((v, i) => {
      let j = i
      let sum = 0
      for (; j < Math.min(i + 20, wattage.length); j++) {
        sum += wattage[j][1]
      }
      // console.log(i,j,sum)
      return [v[0], sum / (j - i)]
    })
    let i = wattage.length - 1
    for (; i >= 0; i--) {
      if (wattage[i][1] > 20.0) {
        break
      }
    }
    wattage = wattage.slice(0, i + 1)
    average = average.slice(0, i + 1)
    // console.log(wattage, average)
    setSeries([{
      name: "Wattage (Average)",
      data: average
    }, {
      name: "Wattage (Actual)",
      data: wattage
    }])

    const n = Math.ceil(i / 200)
    setOptions({
      xaxis: {
        tickAmount: n,
        max: n * 10,
      }
    })
  }

  // useEffect(() => {
  //   Papa.parse("2019-09-21 SM UniLog 2 Datei 0003.txt", {
  //     download: true,
  //     dynamicTyping: true,
  //     complete: onLoadComplete
  //   })
  // }, [])

  const onDrop = useCallback(acceptedFiles => {
    // console.log(acceptedFiles)
    setOptions({
      title: {
        text: acceptedFiles[0].name,
      }
    })
    Papa.parse(acceptedFiles[0], {
      dynamicTyping: true,
      complete: onLoadComplete
    })
  }, [])
  const { getRootProps, isDragActive } = useDropzone({ onDrop, accept: '.txt' })

  return (
    <div className="app" {...getRootProps()}>
      <Chart
        options={options}
        series={series}
        type="line"
        width="100%"
        height="100%"
      />
    </div>
  )
}
