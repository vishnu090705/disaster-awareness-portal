import "./ConfirmModal.css";

export default function ConfirmModal({
  message,
  onConfirm,
  onCancel
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Confirm Action</h3>
        <p>{message}</p>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}