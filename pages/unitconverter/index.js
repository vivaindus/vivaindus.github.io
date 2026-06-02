import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const UNIT_CATEGORIES = {
  length: {
    label: 'Length & Distance',
    desc: 'Convert meters, kilometers, miles, feet, inches, yards, centimeters and millimeters.',
    base: 'meter',
    units: {
      meter: { label: 'Meter', symbol: 'm', factor: 1 },
      kilometer: { label: 'Kilometer', symbol: 'km', factor: 1000 },
      centimeter: { label: 'Centimeter', symbol: 'cm', factor: 0.01 },
      millimeter: { label: 'Millimeter', symbol: 'mm', factor: 0.001 },
      mile: { label: 'Mile', symbol: 'mi', factor: 1609.344 },
      yard: { label: 'Yard', symbol: 'yd', factor: 0.9144 },
      foot: { label: 'Foot', symbol: 'ft', factor: 0.3048 },
      inch: { label: 'Inch', symbol: 'in', factor: 0.0254 },
      nauticalMile: { label: 'Nautical Mile', symbol: 'nmi', factor: 1852 }
    }
  },

  area: {
    label: 'Area & Land',
    desc: 'Convert square meters, square feet, acres, hectares, cents and regional land units.',
    base: 'squareMeter',
    units: {
      squareMeter: { label: 'Square Meter', symbol: 'm²', factor: 1 },
      squareKilometer: { label: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
      squareFoot: { label: 'Square Foot', symbol: 'ft²', factor: 0.09290304 },
      squareYard: { label: 'Square Yard', symbol: 'yd²', factor: 0.83612736 },
      acre: { label: 'Acre', symbol: 'ac', factor: 4046.8564224 },
      hectare: { label: 'Hectare', symbol: 'ha', factor: 10000 },
      cent: { label: 'Cent', symbol: 'cent', factor: 40.468564224 },
      ground: { label: 'Ground', symbol: 'ground', factor: 222.967296 },
      guntha: { label: 'Guntha', symbol: 'guntha', factor: 101.17141056 }
    }
  },

  mass: {
    label: 'Weight & Mass',
    desc: 'Convert kilograms, grams, pounds, ounces, tons and carats.',
    base: 'kilogram',
    units: {
      kilogram: { label: 'Kilogram', symbol: 'kg', factor: 1 },
      gram: { label: 'Gram', symbol: 'g', factor: 0.001 },
      milligram: { label: 'Milligram', symbol: 'mg', factor: 0.000001 },
      metricTon: { label: 'Metric Ton', symbol: 't', factor: 1000 },
      pound: { label: 'Pound', symbol: 'lb', factor: 0.45359237 },
      ounce: { label: 'Ounce', symbol: 'oz', factor: 0.028349523125 },
      stone: { label: 'Stone', symbol: 'st', factor: 6.35029318 },
      carat: { label: 'Carat', symbol: 'ct', factor: 0.0002 }
    }
  },

  temperature: {
    label: 'Temperature',
    desc: 'Convert Celsius, Fahrenheit and Kelvin.',
    type: 'temperature',
    units: {
      celsius: { label: 'Celsius', symbol: '°C' },
      fahrenheit: { label: 'Fahrenheit', symbol: '°F' },
      kelvin: { label: 'Kelvin', symbol: 'K' }
    }
  },

  volume: {
    label: 'Volume & Capacity',
    desc: 'Convert liters, milliliters, gallons, cups, pints and cubic units.',
    base: 'liter',
    units: {
      liter: { label: 'Liter', symbol: 'L', factor: 1 },
      milliliter: { label: 'Milliliter', symbol: 'mL', factor: 0.001 },
      cubicMeter: { label: 'Cubic Meter', symbol: 'm³', factor: 1000 },
      cubicCentimeter: { label: 'Cubic Centimeter', symbol: 'cm³', factor: 0.001 },
      usGallon: { label: 'US Gallon', symbol: 'gal', factor: 3.785411784 },
      imperialGallon: { label: 'Imperial Gallon', symbol: 'imp gal', factor: 4.54609 },
      usQuart: { label: 'US Quart', symbol: 'qt', factor: 0.946352946 },
      usPint: { label: 'US Pint', symbol: 'pt', factor: 0.473176473 },
      usCup: { label: 'US Cup', symbol: 'cup', factor: 0.2365882365 },
      tablespoon: { label: 'Tablespoon', symbol: 'tbsp', factor: 0.0147867648 },
      teaspoon: { label: 'Teaspoon', symbol: 'tsp', factor: 0.00492892159 }
    }
  },

  speed: {
    label: 'Speed',
    desc: 'Convert km/h, mph, m/s and knots.',
    base: 'meterPerSecond',
    units: {
      meterPerSecond: { label: 'Meter/Second', symbol: 'm/s', factor: 1 },
      kilometerPerHour: { label: 'Kilometer/Hour', symbol: 'km/h', factor: 0.2777777778 },
      milePerHour: { label: 'Mile/Hour', symbol: 'mph', factor: 0.44704 },
      footPerSecond: { label: 'Foot/Second', symbol: 'ft/s', factor: 0.3048 },
      knot: { label: 'Knot', symbol: 'kn', factor: 0.5144444444 }
    }
  },

  time: {
    label: 'Time',
    desc: 'Convert seconds, minutes, hours, days, weeks, months and years.',
    base: 'second',
    units: {
      second: { label: 'Second', symbol: 's', factor: 1 },
      millisecond: { label: 'Millisecond', symbol: 'ms', factor: 0.001 },
      minute: { label: 'Minute', symbol: 'min', factor: 60 },
      hour: { label: 'Hour', symbol: 'hr', factor: 3600 },
      day: { label: 'Day', symbol: 'day', factor: 86400 },
      week: { label: 'Week', symbol: 'week', factor: 604800 },
      month: { label: 'Month', symbol: 'month', factor: 2629800 },
      year: { label: 'Year', symbol: 'yr', factor: 31557600 }
    }
  },

  data: {
    label: 'Digital Storage',
    desc: 'Convert bytes, KB, MB, GB, TB and binary KiB, MiB, GiB units.',
    base: 'byte',
    units: {
      byte: { label: 'Byte', symbol: 'B', factor: 1 },
      kilobyte: { label: 'Kilobyte', symbol: 'KB', factor: 1000 },
      megabyte: { label: 'Megabyte', symbol: 'MB', factor: 1000000 },
      gigabyte: { label: 'Gigabyte', symbol: 'GB', factor: 1000000000 },
      terabyte: { label: 'Terabyte', symbol: 'TB', factor: 1000000000000 },
      kibibyte: { label: 'Kibibyte', symbol: 'KiB', factor: 1024 },
      mebibyte: { label: 'Mebibyte', symbol: 'MiB', factor: 1048576 },
      gibibyte: { label: 'Gibibyte', symbol: 'GiB', factor: 1073741824 },
      tebibyte: { label: 'Tebibyte', symbol: 'TiB', factor: 1099511627776 }
    }
  },

  energy: {
    label: 'Energy',
    desc: 'Convert joules, kilojoules, calories, kilocalories, watt-hours and BTU.',
    base: 'joule',
    units: {
      joule: { label: 'Joule', symbol: 'J', factor: 1 },
      kilojoule: { label: 'Kilojoule', symbol: 'kJ', factor: 1000 },
      calorie: { label: 'Calorie', symbol: 'cal', factor: 4.184 },
      kilocalorie: { label: 'Kilocalorie', symbol: 'kcal', factor: 4184 },
      wattHour: { label: 'Watt-hour', symbol: 'Wh', factor: 3600 },
      kilowattHour: { label: 'Kilowatt-hour', symbol: 'kWh', factor: 3600000 },
      btu: { label: 'BTU', symbol: 'BTU', factor: 1055.05585262 }
    }
  },

  pressure: {
    label: 'Pressure',
    desc: 'Convert pascal, bar, PSI, atmosphere and mmHg.',
    base: 'pascal',
    units: {
      pascal: { label: 'Pascal', symbol: 'Pa', factor: 1 },
      kilopascal: { label: 'Kilopascal', symbol: 'kPa', factor: 1000 },
      bar: { label: 'Bar', symbol: 'bar', factor: 100000 },
      psi: { label: 'PSI', symbol: 'psi', factor: 6894.757293 },
      atmosphere: { label: 'Atmosphere', symbol: 'atm', factor: 101325 },
      mmhg: { label: 'Millimeter Mercury', symbol: 'mmHg', factor: 133.322387415 }
    }
  }
};

const QUICK_CONVERSIONS = [
  { label: '1 acre to square feet', category: 'area', value: 1, from: 'acre', to: 'squareFoot' },
  { label: '1 cent to square feet', category: 'area', value: 1, from: 'cent', to: 'squareFoot' },
  { label: '100 km/h to mph', category: 'speed', value: 100, from: 'kilometerPerHour', to: 'milePerHour' },
  { label: '1 mile to km', category: 'length', value: 1, from: 'mile', to: 'kilometer' },
  { label: '1 kg to pounds', category: 'mass', value: 1, from: 'kilogram', to: 'pound' },
  { label: '100 °F to °C', category: 'temperature', value: 100, from: 'fahrenheit', to: 'celsius' },
  { label: '1 GB to MB', category: 'data', value: 1, from: 'gigabyte', to: 'megabyte' },
  { label: '1 gallon to liters', category: 'volume', value: 1, from: 'usGallon', to: 'liter' }
];

export default function UnitConverter() {
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState('length');
  const [value, setValue] = useState(1);
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [precision, setPrecision] = useState(4);
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setMounted(true);

    try {
      const saved = JSON.parse(localStorage.getItem('shb_unit_history') || '[]');
      if (Array.isArray(saved)) setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const units = UNIT_CATEGORIES[category].units;

  const result = useMemo(() => {
    return convertUnit({
      category,
      value: safeNumber(value),
      from: fromUnit,
      to: toUnit
    });
  }, [category, value, fromUnit, toUnit]);

  const formattedResult = useMemo(() => {
    return formatNumber(result, precision);
  }, [result, precision]);

  const formulaText = useMemo(() => {
    return buildFormulaText(category, value, fromUnit, toUnit, result, precision);
  }, [category, value, fromUnit, toUnit, result, precision]);

  const allConversions = useMemo(() => {
    return Object.keys(units).map(unitKey => ({
      key: unitKey,
      label: units[unitKey].label,
      symbol: units[unitKey].symbol,
      value: convertUnit({
        category,
        value: safeNumber(value),
        from: fromUnit,
        to: unitKey
      })
    }));
  }, [category, value, fromUnit, units]);

  const showToast = (message) => {
    setNotification(message);
  };

  const setCategoryAndDefaults = (nextCategory) => {
    const keys = Object.keys(UNIT_CATEGORIES[nextCategory].units);

    setCategory(nextCategory);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    showToast('Units swapped.');
  };

  const copyConversion = async () => {
    const text = `${value} ${units[fromUnit].label} = ${formattedResult} ${units[toUnit].label}`;

    try {
      await navigator.clipboard.writeText(text);
      saveHistory(text);
      showToast('Conversion copied.');
    } catch {
      showToast('Copy failed. Please copy manually.');
    }
  };

  const saveHistory = (text) => {
    const item = {
      id: Date.now(),
      text,
      category,
      createdAt: new Date().toISOString()
    };

    const next = [item, ...history].slice(0, 8);
    setHistory(next);

    try {
      localStorage.setItem('shb_unit_history', JSON.stringify(next));
    } catch {
      // Ignore storage issues.
    }
  };

  const applyQuickConversion = (item) => {
    setCategory(item.category);
    setValue(item.value);
    setFromUnit(item.from);
    setToUnit(item.to);
    showToast(item.label);
  };

  const clearHistory = () => {
    setHistory([]);

    try {
      localStorage.removeItem('shb_unit_history');
    } catch {
      // Ignore storage issues.
    }

    showToast('History cleared.');
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="Unit Converter" description="Loading unit converter.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading conversion engine...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="Unit Converter - Length, Area, Weight, Temperature, Volume, Speed and Data"
      description="Convert length, area, weight, temperature, volume, speed, time, digital storage, energy and pressure units. Includes acres, cents, square feet, kg, pounds, miles, kilometers and more."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free all-in-one measurement converter</p>
          <h1 style={heroTitle}>Unit Converter</h1>
          <p style={heroText}>
            Convert length, area, weight, temperature, volume, speed, time, digital storage, energy and pressure units.
            Built for students, engineers, real estate users, ecommerce teams, IT professionals and everyday calculations.
          </p>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <section style={categoryGrid}>
              {Object.entries(UNIT_CATEGORIES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setCategoryAndDefaults(key)}
                  style={category === key ? activeCategoryBtn : categoryBtn}
                >
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                </button>
              ))}
            </section>

            <section style={converterPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>{UNIT_CATEGORIES[category].label} Converter</h2>
                  <p style={sectionText}>{UNIT_CATEGORIES[category].desc}</p>
                </div>

                <label style={precisionWrap}>
                  <span>Precision</span>
                  <select value={precision} onChange={event => setPrecision(Number(event.target.value))} style={precisionSelect}>
                    <option value={2}>2 decimals</option>
                    <option value={4}>4 decimals</option>
                    <option value={6}>6 decimals</option>
                    <option value={8}>8 decimals</option>
                  </select>
                </label>
              </div>

              <div style={conversionGrid}>
                <div style={convertBox}>
                  <label style={fieldLabel}>From</label>
                  <input
                    type="number"
                    value={value}
                    onChange={event => setValue(event.target.value)}
                    style={numberInput}
                  />
                  <select value={fromUnit} onChange={event => setFromUnit(event.target.value)} style={selectInput}>
                    {Object.entries(units).map(([key, unit]) => (
                      <option key={key} value={key}>{unit.label} ({unit.symbol})</option>
                    ))}
                  </select>
                </div>

                <button onClick={swapUnits} style={swapBtn} title="Swap units">
                  ⇄
                </button>

                <div style={resultBox}>
                  <label style={{ ...fieldLabel, color: '#38bdf8' }}>To</label>
                  <div onClick={copyConversion} style={resultValue}>
                    {formattedResult}
                  </div>
                  <select value={toUnit} onChange={event => setToUnit(event.target.value)} style={selectInput}>
                    {Object.entries(units).map(([key, unit]) => (
                      <option key={key} value={key}>{unit.label} ({unit.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={formulaBox}>
                <strong>Conversion:</strong> {formulaText}
              </div>

              <div style={actionRow}>
                <button onClick={copyConversion} style={primaryBtn}>Copy Conversion</button>
                <button
                  onClick={() => {
                    setValue(1);
                    showToast('Value reset.');
                  }}
                  style={secondaryBtn}
                >
                  Reset Value
                </button>
              </div>
            </section>

            <section style={quickPanel}>
              <h2 style={sectionTitle}>Popular Quick Conversions</h2>
              <div style={quickGrid}>
                {QUICK_CONVERSIONS.map(item => (
                  <button key={item.label} onClick={() => applyQuickConversion(item)} style={quickBtn}>
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section style={allUnitsPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Convert to All {UNIT_CATEGORIES[category].label} Units</h2>
                  <p style={sectionText}>See the same value converted across every unit in this category.</p>
                </div>
              </div>

              <div style={allUnitsGrid}>
                {allConversions.map(item => (
                  <div key={item.key} style={unitResultCard}>
                    <span>{item.label}</span>
                    <strong>{formatNumber(item.value, precision)}</strong>
                    <small>{item.symbol}</small>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Recent Conversions</h2>

            {history.length === 0 ? (
              <p style={emptyText}>Copy a conversion to save it here.</p>
            ) : (
              <div style={historyList}>
                {history.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigator.clipboard.writeText(item.text)}
                    style={historyItem}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            )}

            {history.length > 0 && (
              <button onClick={clearHistory} style={dangerBtn}>Clear History</button>
            )}

            <div style={tipBox}>
              <h3>Accuracy note</h3>
              <p>
                Conversions use fixed standard factors. Regional land units can vary by location, so verify locally for legal property documents.
              </p>
            </div>

            <div style={tipBox}>
              <h3>Real estate tip</h3>
              <p>
                Use Area & Land to convert acres, cents, square feet, square meters, hectares, grounds and guntha.
              </p>
            </div>
          </aside>
        </section>

        
        <RelatedTools currentPath="/unitconverter" />

<section style={contentSection}>
          <h2>All-in-one unit converter for metric, imperial and regional units</h2>
          <p>
            This unit converter helps you convert common measurement types including length, area, weight, temperature, volume,
            speed, time, digital storage, energy and pressure. It is useful for searches such as meters to feet, kilometers to
            miles, kg to pounds, acres to square feet, cents to square feet, Celsius to Fahrenheit, liters to gallons, GB to MB,
            PSI to bar and many more everyday conversions.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Length converter</h3>
              <p>
                Convert meters, kilometers, centimeters, millimeters, miles, yards, feet, inches and nautical miles for travel,
                construction, engineering, study and daily use.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Area converter with acres, cents and square feet</h3>
              <p>
                Convert square meters, square feet, acres, hectares, cents, grounds and guntha. This is useful for real estate,
                land measurement, property listings and construction planning.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Weight and mass converter</h3>
              <p>
                Convert kilograms, grams, milligrams, metric tons, pounds, ounces, stones and carats for shipping, fitness,
                jewelry, recipes and product specifications.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Temperature converter</h3>
              <p>
                Convert Celsius, Fahrenheit and Kelvin for weather, cooking, science, HVAC, laboratory work and international
                measurement comparisons.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Volume and capacity converter</h3>
              <p>
                Convert liters, milliliters, cubic meters, gallons, cups, pints, tablespoons and teaspoons for recipes,
                liquids, packaging and logistics.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Digital storage converter</h3>
              <p>
                Convert bytes, KB, MB, GB, TB and binary KiB, MiB, GiB and TiB for cloud storage, hosting, file sizes,
                backups and IT planning.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Speed converter</h3>
              <p>
                Convert km/h, mph, m/s, ft/s and knots for driving, aviation, marine use, sports, physics and travel planning.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Pressure and energy converters</h3>
              <p>
                Convert PSI, bar, pascal, atmosphere, mmHg, joules, calories, watt-hours and BTU for engineering, HVAC,
                nutrition and technical work.
              </p>
            </div>
          </div>

          <h2>How unit conversion works</h2>
          <p>
            Most unit conversions use a base unit. For example, length conversions can use meters as the base. To convert feet to
            meters, the value is multiplied by the standard factor for feet. To convert meters to kilometers, the base value is
            divided by the kilometer factor. Temperature is different because Celsius, Fahrenheit and Kelvin require formulas with
            offsets, not only multiplication factors.
          </p>

          <h2>Popular conversion examples</h2>
          <ul style={tipList}>
            <li><strong>1 acre to square feet:</strong> useful for land measurement and property listings.</li>
            <li><strong>1 cent to square feet:</strong> useful in regions where cent is common for land area.</li>
            <li><strong>100 km/h to mph:</strong> useful for comparing speed limits and vehicle specs.</li>
            <li><strong>1 kg to pounds:</strong> useful for shipping, gym weights and product weight conversion.</li>
            <li><strong>Celsius to Fahrenheit:</strong> useful for weather, cooking and international temperature comparison.</li>
            <li><strong>GB to MB:</strong> useful for storage, file sizes, hosting and backups.</li>
          </ul>
        </section>

        <section style={faqSection}>
          <h2>Unit Converter FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I convert acres to square feet?</h3>
              <p>Yes. Choose Area & Land, select acre as the source unit and square foot as the target unit.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I convert cents to square feet?</h3>
              <p>Yes. The Area & Land category includes cents, square feet, square meters, acres and hectares.</p>
            </div>

            <div style={faqItem}>
              <h3>Does temperature use the same formula as other units?</h3>
              <p>No. Temperature conversion uses special formulas because Fahrenheit, Celsius and Kelvin have different zero points.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I copy the conversion result?</h3>
              <p>Yes. Click Copy Conversion or click the result value to copy the conversion text.</p>
            </div>

            <div style={faqItem}>
              <h3>Are digital storage units decimal or binary?</h3>
              <p>The converter includes both decimal units such as KB, MB and GB, and binary units such as KiB, MiB and GiB.</p>
            </div>

            <div style={faqItem}>
              <h3>Is this converter private?</h3>
              <p>Yes. Conversion calculations run in your browser. Recent history is saved locally only when you copy a conversion.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function convertUnit({ category, value, from, to }) {
  const categoryData = UNIT_CATEGORIES[category];

  if (!categoryData) return 0;

  if (categoryData.type === 'temperature') {
    return convertTemperature(value, from, to);
  }

  const fromUnit = categoryData.units[from];
  const toUnit = categoryData.units[to];

  if (!fromUnit || !toUnit) return 0;

  const baseValue = value * fromUnit.factor;
  return baseValue / toUnit.factor;
}

function convertTemperature(value, from, to) {
  let celsius = value;

  if (from === 'fahrenheit') {
    celsius = (value - 32) * 5 / 9;
  }

  if (from === 'kelvin') {
    celsius = value - 273.15;
  }

  if (to === 'celsius') return celsius;
  if (to === 'fahrenheit') return (celsius * 9 / 5) + 32;
  if (to === 'kelvin') return celsius + 273.15;

  return celsius;
}

function buildFormulaText(category, value, from, to, result, precision) {
  const categoryData = UNIT_CATEGORIES[category];
  const fromLabel = categoryData.units[from]?.label || from;
  const toLabel = categoryData.units[to]?.label || to;

  if (categoryData.type === 'temperature') {
    return `${value} ${fromLabel} = ${formatNumber(result, precision)} ${toLabel}. Temperature conversions use offset formulas, not only multiplication.`;
  }

  const fromFactor = categoryData.units[from]?.factor || 1;
  const toFactor = categoryData.units[to]?.factor || 1;

  return `${value} ${fromLabel} × ${formatNumber(fromFactor, 8)} ÷ ${formatNumber(toFactor, 8)} = ${formatNumber(result, precision)} ${toLabel}`;
}

function formatNumber(value, precision) {
  const number = safeNumber(value);

  if (Math.abs(number) > 0 && Math.abs(number) < 0.000001) {
    return number.toExponential(4);
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: precision,
    minimumFractionDigits: 0
  });
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

const pageWrap = { maxWidth: '1180px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '920px', margin: '0 auto', lineHeight: 1.75 };

const appGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' };
const mainPanel = { display: 'grid', gap: '22px' };
const sidePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px', display: 'grid', gap: '18px' };

const categoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' };
const categoryBtn = { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'grid', gap: '7px', textAlign: 'left', cursor: 'pointer' };
const activeCategoryBtn = { ...categoryBtn, background: 'rgba(56,189,248,0.12)', border: '1px solid #38bdf8' };

const converterPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '20px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.28rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 0', fontSize: '0.92rem' };
const precisionWrap = { display: 'grid', gap: '7px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' };
const precisionSelect = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '10px', outline: 'none' };

const conversionGrid = { display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 58px minmax(220px, 1fr)', gap: '14px', alignItems: 'center' };
const convertBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '22px', padding: '22px', display: 'grid', gap: '14px' };
const resultBox = { ...convertBox, border: '1px solid #38bdf8', background: 'rgba(56,189,248,0.06)' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const numberInput = { width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid #334155', color: '#fff', padding: '10px 0', outline: 'none', fontSize: '2rem', fontWeight: 950 };
const selectInput = { width: '100%', background: '#111827', color: '#fff', border: '1px solid #334155', borderRadius: '13px', padding: '12px', outline: 'none' };
const resultValue = { color: '#fff', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 950, wordBreak: 'break-word', cursor: 'pointer' };
const swapBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '50%', width: '54px', height: '54px', fontSize: '1.5rem', fontWeight: 950, cursor: 'pointer' };

const formulaBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', color: '#cbd5e1', lineHeight: 1.6 };
const actionRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 950, cursor: 'pointer' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 850, cursor: 'pointer' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '13px 15px', fontWeight: 850, cursor: 'pointer' };

const quickPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '22px' };
const quickGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '14px' };
const quickBtn = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '14px', padding: '12px', cursor: 'pointer', fontWeight: 850, textAlign: 'left' };

const allUnitsPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px' };
const allUnitsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '18px' };
const unitResultCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '15px', display: 'grid', gap: '7px', color: '#94a3b8' };

const sideTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const historyList = { display: 'grid', gap: '10px' };
const historyItem = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '13px', padding: '12px', textAlign: 'left', cursor: 'pointer', lineHeight: 1.45 };
const emptyText = { color: '#64748b', lineHeight: 1.6, margin: 0 };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const tipList = { paddingLeft: '20px', lineHeight: 1.9 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };