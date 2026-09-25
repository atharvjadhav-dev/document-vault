const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Known Magic Number Signatures (in hex)
const MAGIC_SIGNATURES = {
  // PDF: %PDF- (25 50 44 46)
  pdf: [
    [0x25, 0x50, 0x44, 0x46],
  ],
  // JPEG / JPG: FF D8 FF
  jpg: [
    [0xFF, 0xD8, 0xFF],
  ],
  jpeg: [
    [0xFF, 0xD8, 0xFF],
  ],
  // PNG: \x89PNG\r\n\x1a\n (89 50 4E 47 0D 0A 1A 0A)
  png: [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  ],
  // DOCX: ZIP archive format (PK\x03\x04 or PK\x05\x06)
  docx: [
    [0x50, 0x4B, 0x03, 0x04],
    [0x50, 0x4B, 0x05, 0x06],
  ],
  // DOC: Microsoft Compound Binary Document (D0 CF 11 E0 A1 B1 1A E1)
  doc: [
    [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],
  ],
};

// Disallowed executable / dangerous signatures regardless of extension
const DANGEROUS_SIGNATURES = [
  // Windows DOS/PE Executable: MZ (4D 5A)
  { name: 'Windows Executable/DLL (PE)', bytes: [0x4D, 0x5A] },
  // Linux ELF Executable: \x7FELF (7F 45 4C 46)
  { name: 'Linux Executable (ELF)', bytes: [0x7F, 0x45, 0x4C, 0x46] },
  // Java Class File: CA FE BA BE
  { name: 'Java Class File', bytes: [0xCA, 0xFE, 0xBA, 0xBE] },
  // Unix Shell Script: #! (23 21)
  { name: 'Unix Shell Script', bytes: [0x23, 0x21] },
];

/**
 * Checks if the buffer starts with the given byte array.
 * @param {Buffer} buffer
 * @param {number[]} bytes
 * @returns {boolean}
 */
const matchesBytes = (buffer, bytes) => {
  if (buffer.length < bytes.length) return false;
  for (let i = 0; i < bytes.length; i++) {
    if (buffer[i] !== bytes[i]) return false;
  }
  return true;
};

/**
 * Inspects a file's raw header bytes (magic numbers) on disk.
 * Detects extension spoofing and disguised executables.
 *
 * @param {string} filePath - Absolute path to uploaded file on disk
 * @param {string} originalFilename - User's original filename
 * @returns {{ valid: boolean, error?: string }}
 */
const validateFileSignature = (filePath, originalFilename) => {
  let fd;
  try {
    const ext = path.extname(originalFilename).toLowerCase().replace('.', '');
    const headerBuffer = Buffer.alloc(512);

    fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, headerBuffer, 0, 512, 0);
    fs.closeSync(fd);
    fd = null;

    if (bytesRead < 4) {
      return { valid: false, error: 'File is empty or corrupted.' };
    }

    const buffer = headerBuffer.subarray(0, bytesRead);

    // 1. Check for universally dangerous executable signatures
    for (const dangerous of DANGEROUS_SIGNATURES) {
      if (matchesBytes(buffer, dangerous.bytes)) {
        logger.warn('Security alert: Malicious file signature detected', {
          originalFilename,
          detectedSignature: dangerous.name,
        });
        return {
          valid: false,
          error: `Security violation: File contains prohibited executable code (${dangerous.name}).`,
        };
      }
    }

    // 2. Validate plain text files
    if (ext === 'txt') {
      // Reject binary null bytes in txt files
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === 0x00) {
          return {
            valid: false,
            error: 'Invalid text file: File contains binary content.',
          };
        }
      }

      // Check for disguised server-side script tags
      const sampleText = buffer.toString('utf8', 0, Math.min(256, buffer.length)).toLowerCase();
      if (
        sampleText.includes('<?php') ||
        sampleText.includes('<script') ||
        sampleText.includes('<%')
      ) {
        logger.warn('Security alert: Script payload detected in text file', { originalFilename });
        return {
          valid: false,
          error: 'Security violation: Executable script code detected in text file.',
        };
      }

      return { valid: true };
    }

    // 3. Validate binary files matching their claimed extension
    const expectedSignatures = MAGIC_SIGNATURES[ext];
    if (expectedSignatures) {
      const hasValidMagic = expectedSignatures.some((sig) => matchesBytes(buffer, sig));
      if (!hasValidMagic) {
        logger.warn('Security alert: MIME spoofing detected via magic numbers', {
          originalFilename,
          claimedExtension: ext,
        });
        return {
          valid: false,
          error: `File signature mismatch: File content does not match the .${ext} extension.`,
        };
      }
    }

    return { valid: true };
  } catch (error) {
    if (fd) {
      try { fs.closeSync(fd); } catch (_) {}
    }
    logger.error('Error during file signature inspection', {
      filePath,
      error: error.message,
    });
    return { valid: false, error: 'File security verification failed.' };
  }
};

module.exports = {
  validateFileSignature,
  MAGIC_SIGNATURES,
  DANGEROUS_SIGNATURES,
};
