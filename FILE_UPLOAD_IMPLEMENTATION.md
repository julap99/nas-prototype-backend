# File Upload Implementation for Asnaf Profiling

This document explains the file upload functionality implemented for the POST `/alamat` endpoint in the Asnaf Profiling module.

## Overview

The POST `/alamat` endpoint now supports file/document uploads along with address information. Files are stored on the server filesystem and metadata is stored in the database.

## Features

- **Multiple file uploads**: Up to 5 files per request
- **File type validation**: Supports images (JPEG, PNG, GIF), PDFs, Word documents, and text files
- **File size limits**: Maximum 10MB per file
- **Secure file storage**: Files stored with unique names to prevent conflicts
- **Database tracking**: File metadata stored in `k_asnaf_documents` table
- **File serving**: Documents can be retrieved via GET `/documents/:documentId`

## Database Schema

### k_asnaf_documents Table

```sql
CREATE TABLE k_asnaf_documents (
  id_asnaf_document INT PRIMARY KEY AUTO_INCREMENT,
  asnaf_uuid VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  document_type VARCHAR(100) NULL,
  description TEXT NULL,
  status INT DEFAULT 1,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_asnaf_uuid (asnaf_uuid),
  INDEX idx_document_type (document_type),
  INDEX idx_status (status),
  
  FOREIGN KEY (asnaf_uuid) REFERENCES k_asnaf_profiling(asnaf_uuid)
);
```

## API Endpoints

### 1. POST /asnaf/profiling/alamat

Upload address information with documents.

**Request:**
- Content-Type: `multipart/form-data`
- Authentication: Basic Auth required

**Form Data:**
- `asnafUuid` (string, required): The asnaf UUID
- `alamat1` (string, required): First address line
- `alamat2` (string, required): Second address line
- `documents` (files, optional): Up to 5 files

**Response:**
```json
{
  "asnafUuid": "uuid-here",
  "alamat1": "Address Line 1",
  "alamat2": "Address Line 2",
  "status": 1,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "documents": [
    {
      "id": 1,
      "originalName": "document.pdf",
      "filename": "document-1705312200000-123456789.pdf",
      "path": "/path/to/uploads/asnaf-documents/document-1705312200000-123456789.pdf",
      "size": 1024000,
      "mimetype": "application/pdf",
      "documentType": "address_document"
    }
  ]
}
```

### 2. GET /asnaf/profiling/alamat/:asnafUuid

Retrieve address information with associated documents.

**Response:**
```json
{
  "asnafUuid": "uuid-here",
  "alamat1": "Address Line 1",
  "alamat2": "Address Line 2",
  "documents": [
    {
      "id": 1,
      "originalName": "document.pdf",
      "filename": "document-1705312200000-123456789.pdf",
      "path": "/path/to/uploads/asnaf-documents/document-1705312200000-123456789.pdf",
      "size": 1024000,
      "mimetype": "application/pdf",
      "documentType": "address_document"
    }
  ]
}
```

### 3. GET /asnaf/profiling/documents/:documentId

Download/view a specific document.

**Response:**
- File stream with appropriate Content-Type and Content-Disposition headers

## File Storage

### Directory Structure
```
uploads/
└── asnaf-documents/
    ├── document-1705312200000-123456789.pdf
    ├── image-1705312200001-987654321.jpg
    └── ...
```

### File Naming Convention
- Format: `{original-name}-{timestamp}-{random}.{extension}`
- Example: `document-1705312200000-123456789.pdf`

### Supported File Types
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF, DOC, DOCX
- Text: TXT

## Implementation Details

### File Upload Interceptor
- **Location**: `src/asnaf/profiling/interceptors/file-upload.interceptor.ts`
- **Features**:
  - File validation (type, size)
  - Unique filename generation
  - Directory creation
  - Error handling

### Service Methods
- `createMaklumatAlamat()`: Handles address creation/update with document storage
- `getAsnafDetail()`: Retrieves address info with associated documents
- `getDocumentById()`: Fetches specific document metadata

### Security Considerations
- File type validation
- File size limits
- Unique filename generation
- Authentication required for all endpoints
- Files stored outside web root

## Usage Examples

### Frontend (JavaScript)
```javascript
const formData = new FormData();
formData.append('asnafUuid', 'uuid-here');
formData.append('alamat1', 'Address Line 1');
formData.append('alamat2', 'Address Line 2');

// Add files
const fileInput = document.getElementById('fileInput');
for (let file of fileInput.files) {
  formData.append('documents', file);
}

const response = await fetch('/asnaf/profiling/alamat', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('username:password')
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

### cURL Example
```bash
curl -X POST http://localhost:3001/asnaf/profiling/alamat \
  -H "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=" \
  -F "asnafUuid=uuid-here" \
  -F "alamat1=Address Line 1" \
  -F "alamat2=Address Line 2" \
  -F "documents=@/path/to/document.pdf"
```

## Migration

Run the migration to create the documents table:

```bash
npm run migration:run
```

## Error Handling

- **File too large**: Returns 400 Bad Request
- **Invalid file type**: Returns 400 Bad Request
- **Too many files**: Returns 400 Bad Request
- **Document not found**: Returns 404 Not Found
- **File not found on disk**: Returns 404 Not Found

## Future Enhancements

1. **Document categories**: Add specific document types (ID card, income proof, etc.)
2. **File compression**: Compress large files
3. **Cloud storage**: Move files to cloud storage (AWS S3, etc.)
4. **File preview**: Add thumbnail generation for images
5. **Document versioning**: Track document versions
6. **Bulk operations**: Add bulk document upload/download 