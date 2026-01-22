import React, { useMemo } from 'react';

import { Button } from 'react-bootstrap';

import PropTypes from 'prop-types';

import '../styles/pill-button.css';

export default function PillButtonGroup({ label, options, active }) {
  const minWidth = useMemo(() => {
    if (!options || options.length === 0) return 'auto';
    const maxChars = Math.max(...options.map(option => option.label.length));
    // Ensure some breathing room around the widest label
    return `${maxChars + 4}ch`;
  }, [options]);

  return (
    <div className="pill-button-group mb-3">
      {label && <span className="pill-button-label">{label}</span>}
      <div className="d-flex flex-row gap-2">
        {options.map(option => (
          <Button
            key={option.value}
            ref={option.ref}
            variant="none"
            className={`pill-button ${active === option.value ? 'active' : ''}`}
            style={{ minWidth }}
            onClick={() => option.onClick(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

PillButtonGroup.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      ref: PropTypes.object,
      onClick: PropTypes.func.isRequired,
    }),
  ).isRequired,
  active: PropTypes.string.isRequired,
};
