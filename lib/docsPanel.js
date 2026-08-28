/**
 * Documentation Panel Controller
 * Handles loading and opening markdown documentation files in new tabs
 */

(function() {
  'use strict';

  // Configuration
  const DOCS_CONFIG = {
    docsFolder: 'docs/context/',
    files: [
      { name: 'README', path: 'README.md', displayName: 'Project Overview' },
      { name: 'TECHNICAL_DOCUMENTATION', path: 'docs/TECHNICAL_DOCUMENTATION.md', displayName: 'Technical Documentation' },
      { name: 'docs-index', path: 'docs/context/README.md', displayName: 'Documentation Index' },
      { name: 'changelog', path: 'docs/context/changelog.md', displayName: 'Changelog' }
    ]
  };

  /**
   * Initialize the documentation panel
   */
  function initDocsPanel() {
    // DOM Elements
    const docsPanel = document.getElementById('docsPanel');
    const docsList = document.getElementById('docsList');

    if (!docsPanel || !docsList) {
      console.error('Documentation panel elements not found');
      return;
    }

    // Panel is hidden by default (panel-hidden class in HTML)
    // Note: Tab key toggle is handled in decisionTree.js for both panels

    // Load documentation list
    loadDocsList();
  }

  /**
   * Load and display the list of documentation files
   */
  function loadDocsList() {
    const docsList = document.getElementById('docsList');
    
    if (!docsList) {
      console.error('docsList element not found');
      return;
    }

    // Clear loading message
    docsList.innerHTML = '';

    // Create document list items
    DOCS_CONFIG.files.forEach(function(doc) {
      const docItem = document.createElement('div');
      docItem.className = 'doc-item';
      docItem.dataset.path = doc.path;
      docItem.dataset.name = doc.name;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'doc-item-name';
      nameSpan.textContent = doc.displayName;

      const pathSpan = document.createElement('span');
      pathSpan.className = 'doc-item-path';
      pathSpan.textContent = doc.name + '.md';

      docItem.appendChild(nameSpan);
      docItem.appendChild(pathSpan);

      // Click handler to open document in new tab
      docItem.addEventListener('click', function() {
        openDocumentInNewTab(doc.path, doc.displayName);
      });

      docsList.appendChild(docItem);
    });

    console.log('Loaded', DOCS_CONFIG.files.length, 'documentation files');
  }

  /**
   * Open a documentation file in a new browser tab
   */
  function openDocumentInNewTab(path, displayName) {
    // Create URL for the markdown viewer with document path as parameter
    const viewerUrl = 'docs-viewer.html?doc=' + encodeURIComponent(path) + '&title=' + encodeURIComponent(displayName);
    
    // Open in new tab
    window.open(viewerUrl, '_blank');
    console.log('Opening document in new tab:', displayName, path);
  }

  /**
   * Initialize when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocsPanel);
  } else {
    initDocsPanel();
  }

  // Export for debugging (optional)
  window.DocsPanel = {
    openDocument: openDocumentInNewTab,
    getDocsList: function() { return DOCS_CONFIG.files; }
  };

})();