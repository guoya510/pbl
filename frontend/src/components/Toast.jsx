import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const bgColors = {
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db'
  };

  return (
    <div className="toast-container" onClick={onClose}>
      <div className="toast" style={{ backgroundColor: bgColors[type] }}>
        <span className="toast-icon">{icons[type]}</span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

let toastQueue = [];
let toastCallback = null;

export const showToast = (message, type = 'info') => {
  toastQueue.push({ message, type });
  if (toastCallback) {
    toastCallback([...toastQueue]);
  }
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastCallback = setToasts;
    return () => {
      toastCallback = null;
    };
  }, []);

  const removeToast = (index) => {
    toastQueue = toastQueue.filter((_, i) => i !== index);
    setToasts([...toastQueue]);
  };

  return (
    <div className="toasts-wrapper">
      {toasts.map((toast, index) => (
        <Toast
          key={index}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(index)}
        />
      ))}
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, title, message, onConfirm, confirmText = '确定', cancelText = '取消' }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="confirm-btn cancel" onClick={onClose}>
          {cancelText}
        </button>
        <button className="confirm-btn confirm" onClick={handleConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

let confirmCallback = null;

export const showConfirm = (title, message, options = {}) => {
  return new Promise((resolve) => {
    confirmCallback = {
      isOpen: true,
      title,
      message,
      options,
      resolve
    };
  });
};

export const ConfirmModalContainer = () => {
  const [state, setState] = useState(null);

  useEffect(() => {
    const checkCallback = () => {
      if (confirmCallback && !state) {
        setState({
          isOpen: true,
          title: confirmCallback.title,
          message: confirmCallback.message,
          options: confirmCallback.options
        });
      }
    };
    const interval = setInterval(checkCallback, 50);
    return () => clearInterval(interval);
  }, [state]);

  const handleClose = useCallback(() => {
    setState(null);
    if (confirmCallback) {
      confirmCallback.resolve(false);
      confirmCallback = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setState(null);
    if (confirmCallback) {
      confirmCallback.resolve(true);
      confirmCallback = null;
    }
  }, []);

  if (!state) return null;

  return (
    <ConfirmModal
      isOpen={state.isOpen}
      onClose={handleClose}
      title={state.title}
      message={state.message}
      onConfirm={handleConfirm}
      confirmText={state.options.confirmText || '确定'}
      cancelText={state.options.cancelText || '取消'}
    />
  );
};

export default { showToast, ToastContainer, showConfirm, ConfirmModalContainer };
