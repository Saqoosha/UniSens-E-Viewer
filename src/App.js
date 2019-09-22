import React, { useState, useEffect, useCallback } from "react"
import { useDropzone } from 'react-dropzone'
import Chart from "react-apexcharts"
import * as Papa from "papaparse"


export default props => {
  const [options, setOptions] = useState({
    chart: {
      id: "basic-bar"
    },
    stroke: {
      width: 2
    },
    xaxis: {
      type: 'numeric',
      tickAmount: 10,
    },
    yaxis: {
      min: 0,
      max: 2400,
      tickAmount: 4,
      decimalsInFloat: 0,
    }
  })

  const [series, setSeries] = useState([])

  // useEffect(() => {
  //   Papa.parse("2019-09-21 SM UniLog 2 Datei 0004.txt", {
  //     download: true,
  //     dynamicTyping: true,
  //     complete: ({ data, errors, meta }) => {
  //       data.shift() // skip header
  //       console.log(data[1], errors[0], meta)
  //       let W = data.map(d => [d[3], d[8] || 0])
  //       let i = W.length - 1
  //       for (; i >= 0; i--) {
  //         if (W[i][1] > 10.0) {
  //           break
  //         }
  //       }
  //       W = W.slice(0, i + 1)
  //       setSeries([{ name: "W", data: W }])
  //     }
  //   })
  // }, [])

  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles)
    Papa.parse(acceptedFiles[0], {
      dynamicTyping: true,
      complete: ({ data, errors, meta }) => {
        data.shift() // skip header
        console.log(data[1], errors[0], meta)
        let W = data.map(d => [d[3], d[8] || 0])
        let i = W.length - 1
        for (; i >= 0; i--) {
          if (W[i][1] > 20.0) {
            break
          }
        }
        W = W.slice(0, i + 1)
        console.log(W)
        setSeries([{ name: "W", data: W }])
      }
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
