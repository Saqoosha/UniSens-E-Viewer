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
      width: [2, 1, 2, 2]
    },
    colors: ['#038efb', '#02e396', '#ed9dcc', '#ffb782'],
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
    yaxis: [{
      seriesName: "Watts (Average)",
      min: 0,
      max: 2500,
      tickAmount: 5,
      decimalsInFloat: 0,
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
      },
      title: {
        text: "Watts"
      }
    }, {
      seriesName: "Watts (Actual)",
      show: false,
    }, {
      seriesName: "Volts",
      min: 16,
      max: 26,
      tickAmount: 5,
      decimalsInFloat: 0,
      opposite: true,
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
      },
      title: {
        text: "Volts"
      }
    }, {
      seriesName: "Amps",
      min: 0,
      max: 150,
      tickAmount: 6,
      decimalsInFloat: 0,
      opposite: true,
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
      },
      title: {
        text: "Amps"
      }
    }],
    annotations: {
      yaxis: [{
        y: 1800,
        borderColor: "#f00",
        label: {
          offsetX: -15,
          borderColor: "#f00",
          style: {
            color: "#fff",
            background: "#f00"
          },
          text: "1800W"
        }
      }]
    },
    tooltip: {
      x: {
        show: true,
        formatter: value => value.toFixed(2)
      },
      y: {
        show: true,
        formatter: value => value.toFixed(2)
      }
    }
  })

  const [series, setSeries] = useState([])

  const onLoadComplete = ({ data, errors, meta }) => {
    data = data.filter(d => d[0] === "$UL2")
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
    let n = wattage.length - 1
    for (; n >= 0; n--) {
      if (wattage[n][1] > 20.0) {
        break
      }
    }
    let volts = data.map(d => [d[3], d[4] || 0])
    let amps = data.map(d => [d[3], d[5] || 0])
    volts = volts.slice(0, n + 1)
    amps = amps.slice(0, n + 1)
    wattage = wattage.slice(0, n + 1)
    average = average.slice(0, n + 1)
    setSeries([{
      name: "Watts (Average)",
      data: average
    }, {
      name: "Watts (Actual)",
      data: wattage
    }, {
      name: "Volts",
      data: volts,
    }, {
      name: "Amps",
      data: amps
    }])

    const ann = []
    let over = false
    let start = 0
    for (let i = 0; i < n; i++) {
      const w = average[i][1]
      if (!over && w > 1800) {
        over = true
        start = average[i][0]
      } else if (over && w <= 1800) {
        over = false
        let end = average[i - 1][0]
        const a = {
          x: start,
          borderColor: "#f00",
          label: {
            borderColor: "#f00",
            style: {
              color: "#fff",
              background: "#f00"
            },
            text: start.toFixed(2)
          }
        }
        if (start !== end) {
          a.x2 = end
          a.label.text = `${start.toFixed(2)} - ${end.toFixed(2)}`
        }
        ann.push(a)
      }
    }

    n = Math.ceil(n / 200)
    setOptions({
      xaxis: {
        tickAmount: n,
        max: n * 10,
      },
      annotations: { xaxis: ann }
    })
  }

  // useEffect(() => {
  //   Papa.parse("a.txt", {
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
