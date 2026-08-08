import React from 'react';
import {useStreamWithUpdater} from "ui/effects";
import './SketcherDimensionsView.less';

export function SketcherDimensionView() {

  const [definitions, setDefinitions] = useStreamWithUpdater(ctx => ctx.viewer.parametricManager.$constantDefinition);

  // Parse the definitions string into an array of {name, value} objects
  const parseDefinitions = (defs) => {
    if (!defs) return [];
    return defs.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split('=');
        if (parts.length === 2) {
          return {
            name: parts[0].trim(),
            value: parts[1].trim()
          };
        }
        return null;
      })
      .filter(item => item !== null);
  };

  // Convert the array back to the string format
  const formatDefinitions = (items) => {
    return items
      .filter(item => item.name && item.value)
      .map(item => `${item.name} = ${item.value}`)
      .join('\n');
  };

  const dimensionItems = parseDefinitions(definitions);

  const handleNameChange = (index, newName) => {
    const updatedItems = [...dimensionItems];
    updatedItems[index].name = newName;
    setDefinitions(formatDefinitions(updatedItems));
  };

  const handleValueChange = (index, newValue) => {
    const updatedItems = [...dimensionItems];
    updatedItems[index].value = newValue;
    setDefinitions(formatDefinitions(updatedItems));
  };

  const handleAddRow = () => {
    const updatedItems = [...dimensionItems, { name: '', value: '' }];
    setDefinitions(formatDefinitions(updatedItems));
  };

  const handleDeleteRow = (index) => {
    const updatedItems = dimensionItems.filter((_, i) => i !== index);
    setDefinitions(formatDefinitions(updatedItems));
  };

  return (
    <div className="dimensions-table-container">
      <div className="dimensions-table-wrapper">
        <table className="dimensions-table">
          <thead>
            <tr>
              <th className="name-header">Name</th>
              <th className="value-header">Value</th>
              <th className="action-header"></th>
            </tr>
          </thead>
          <tbody>
            {dimensionItems.map((item, index) => (
              <tr key={index}>
                <td className="name-cell">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="dimension-input"
                    placeholder="Name"
                  />
                </td>
                <td className="value-cell">
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    className="dimension-input"
                    placeholder="Value"
                  />
                </td>
                <td className="action-cell">
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteRow(index)}
                    title="Delete dimension"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="add-dimension-btn" onClick={handleAddRow}>
        + Add Dimension
      </button>
    </div>
  );
}
