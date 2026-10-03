import useReveal from "../hooks/useReveal";
// 1. Import your photo here (make sure the filename matches exactly)
import profileImg from "../assets/profile.jpg";

export default function OperatorId() {
  const ref = useReveal();

  return (
    <div className="operator-id landscape reveal" ref={ref}>
      <div className="id-punch-hole"></div>

      <div className="id-main-content">
        <div className="id-photo-container">
          {/* 2. Your photo and the scanner overlay */}
          <img src={profileImg} alt="Operator Biometric" className="id-photo" />
          <div className="id-photo-overlay">
            <div className="crosshair-x"></div>
            <div className="crosshair-y"></div>
          </div>
        </div>

        <div className="id-data-section">
          <div className="id-header">
            <span className="id-dept">PHINMA COC // CPE</span>
            <span className="id-status">ACTIVE</span>
          </div>

          <div className="id-details">
            <div className="id-data-group">
              <p className="id-label">ID_OBJ</p>
              <p className="id-value">AJIAS, RICHMOND D.</p>
            </div>

            <div className="id-data-group">
              <p className="id-label">DESIGNATION</p>
              <p className="id-value">Systems Eng / CpESBO Sec</p>
            </div>

            <div className="id-data-group">
              <p className="id-label">CLEARANCE</p>
              <p className="id-value ember-text">LEVEL-04 // ROOT</p>
            </div>
          </div>
        </div>
      </div>

      <div className="id-footer-row">
        <div className="id-barcode" aria-hidden="true"></div>
        <p className="id-serial">SN: 2006-0825-REV3</p>
      </div>
    </div>
  );
}
