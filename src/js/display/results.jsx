const React = require("react")
const R = require("ramda")

const transformer = require("../helpers/transformer")

const DISPLAY_THRESHOLD = 1000

const Results = React.createClass({
  displayName: "Results",

  propTypes: {
    results: React.PropTypes.any.isRequired,
    groupBy: React.PropTypes.string,
    resultFields: React.PropTypes.array.isRequired,
    schema: React.PropTypes.object.isRequired,
    actionCreator: React.PropTypes.object.isRequired,
    showCounts: React.PropTypes.bool.isRequired,
    filteredLength: React.PropTypes.number.isRequired,
    sum: React.PropTypes.string,
    average: React.PropTypes.string,
  },

  downloadResults: function(data, mimetype, extension) {
    const dataStr = URL.createObjectURL(new Blob([data], {type: mimetype}))
    const downloadLink = document.getElementById("hidden-download-link")
    downloadLink.setAttribute("href", dataStr)
    downloadLink.setAttribute("download", new Date().toISOString() + "." + extension)
    downloadLink.click()
    downloadLink.setAttribute("href", "")
  },

  getDownloadLinks: function() {
    const sumedOrAveraged = !!(this.props.sum || this.props.average)
    const jsonTransformer = transformer.prettify(this.props.groupBy, this.props.showCounts, sumedOrAveraged)
    const csvTransformer = transformer.convertToCsv(this.props.groupBy, this.props.showCounts, sumedOrAveraged)

    const types = [
      {name: "JSON", mimetype: "application/json", extension: "json", transformer: jsonTransformer},
      {name: "CSV", mimetype: "text/csv", extension: "csv", transformer: csvTransformer},
    ]

    return types.map(function(type) {
      const transformed = type.transformer(this.props.results)
      const downloader = this.downloadResults.bind(this, transformed, type.mimetype, type.extension)
      return (<a className="site-link" key={type.name} onClick={downloader}>{type.name}</a>)
    }.bind(this))
  },

  isAggregateResult: function() {
    return this.props.showCounts || this.props.sum || this.props.average
  },

  tooManyResultToShow: function() {
    return this.props.filteredLength > DISPLAY_THRESHOLD
  },

  getDisplayData: function() {
    if (!this.isAggregateResult() && this.tooManyResultToShow())
      return "Results set too large to display, use download options instead"
    return JSON.stringify(this.props.results, null, 2)
  },

  onChangeHandler: function(e) {
    const field = e.target.name
    const isPresent = R.contains(field, this.props.resultFields)
    const updatedFields = (isPresent) ?
      R.without([field], this.props.resultFields) :
      R.append(field, this.props.resultFields)

    this.props.actionCreator.updateResultFields(updatedFields)
  },

  getResultFieldOptions: function() {
    return R.keys(this.props.schema).map(function(field) {
      const checked = R.contains(field, this.props.resultFields)
      const disabled = (field === this.props.groupBy)

      return (
        <label className="result-field" key={field}>
          <input type="checkbox" name={field} disabled={disabled} checked={checked} onChange={this.onChangeHandler} />
          {field}
        </label>
      )
    }.bind(this))
  },

  getCheckboxes: function() {
    return (!this.isAggregateResult()) ? <p>Include: {this.getResultFieldOptions()}</p> : null
  },

  render: function() {
    return (
      <div>
        <h3>Results</h3>
        {this.getCheckboxes()}
        <p className="download-links">Download results as: {this.getDownloadLinks()}</p>
        <pre>{this.getDisplayData()}</pre>
        <a id="hidden-download-link" style={{display: "none"}}></a>
      </div>
    )
  },
})

module.exports = Results