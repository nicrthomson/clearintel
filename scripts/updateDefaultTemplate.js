const { PrismaClient } = require('@prisma/client');

const defaultHTMLTemplate = {
  name: "Default HTML Template",
  description: "Default HTML report template",
  type: "html",
  category: "default",
  metadata: {
    version: "1.0"
  },
  sections: [
    {
      id: "document_properties",
      title: "Document Properties",
      content: `
        <div class="document-meta">
          {{#if documentProperties.confidential}}
            <div class="confidential-mark">CONFIDENTIAL</div>
          {{/if}}
          {{#if documentProperties.draft}}
            <div class="draft-mark">DRAFT</div>
          {{/if}}
          <meta name="author" content="{{documentProperties.author}}">
          <meta name="subject" content="{{documentProperties.subject}}">
          <meta name="keywords" content="{{documentProperties.keywords}}">
        </div>
      `
    },
    {
      id: "page_header",
      title: "Header",
      content: `
        {{#if options.header.enabled}}
          <div class="page-header">
            {{#if options.header.includeLogo}}
              <img src="graphics/logo.png" alt="Organization Logo" class="header-logo"/>
            {{/if}}
            {{#if options.header.customText}}
              <div class="header-text">{{options.header.customText}}</div>
            {{/if}}
            {{#if options.header.includePageNumbers}}
              <div class="page-number">Page {{pageNumber}}</div>
            {{/if}}
          </div>
        {{/if}}
      `
    },
    {
      id: "page_footer",
      title: "Footer",
      content: `
        {{#if options.footer.enabled}}
          <div class="page-footer">
            {{#if options.footer.customText}}
              <div class="footer-text">{{options.footer.customText}}</div>
            {{/if}}
            {{#if options.footer.includeDisclaimer}}
              <div class="disclaimer">Confidential - For authorized use only</div>
            {{/if}}
            {{#if options.footer.includePageNumbers}}
              <div class="page-number">Page {{pageNumber}}</div>
            {{/if}}
          </div>
        {{/if}}
      `
    },
    {
      id: "cover_page",
      title: "Cover Page",
      content: `
        {{#if options.coverPage.enabled}}
          <div class="cover-page">
            {{#if options.coverPage.includeLogo}}
              <img src="graphics/logo.png" alt="Organization Logo" class="cover-logo"/>
            {{/if}}
            <h1>{{case.name}}</h1>
            <div class="cover-meta">
              <p>Case Number: {{case.id}}</p>
              <p>Generated: {{currentDate}}</p>
              <p>Status: {{case.status}}</p>
            </div>
            {{#if documentProperties.confidential}}
              <div class="confidential-mark">CONFIDENTIAL</div>
            {{/if}}
            {{#if documentProperties.draft}}
              <div class="draft-mark">DRAFT</div>
            {{/if}}
          </div>
        {{/if}}
      `
    },
    {
      id: "toc",
      title: "Table of Contents",
      content: `
        <div class="toc">
          <h2>Contents</h2>
          <div class="toc-item"><a href="#case_details">Case Details</a></div>
          {{#if options.executiveSummary.enabled}}
            <div class="toc-item"><a href="#executive_summary">Executive Summary</a></div>
          {{/if}}
          {{#if options.evidence.enabled}}
            <div class="toc-item"><a href="#evidence">Evidence Items</a></div>
            <div class="toc-item"><a href="#evidence_gallery">Evidence Gallery</a></div>
          {{/if}}
          {{#if options.timeline.enabled}}
            <div class="toc-item"><a href="#timeline">Case Timeline</a></div>
          {{/if}}
          {{#if options.activities.enabled}}
            <div class="toc-item"><a href="#activities">Case Activities</a></div>
          {{/if}}
          {{#if options.notes.enabled}}
            <div class="toc-item"><a href="#notes">Case Notes</a></div>
          {{/if}}
          {{#if options.methodology.enabled}}
            <div class="toc-item"><a href="#methodology">Methodology</a></div>
          {{/if}}
          {{#if options.equipment.enabled}}
            <div class="toc-item"><a href="#equipment">Equipment & Tools</a></div>
          {{/if}}
          {{#if options.relatedCases.enabled}}
            <div class="toc-item"><a href="#related_cases">Related Cases</a></div>
          {{/if}}
        </div>
      `
    },
    {
      id: "header",
      title: "Case Report",
      content: `
        <div class="report-header">
          <h1>{{case.name}}</h1>
          <ul class="info-list">
            <li><strong>Case Number:</strong> {{case.id}}</li>
            <li><strong>Date Generated:</strong> {{currentDate}}</li>
            <li><strong>Status:</strong> {{case.status}}</li>
          </ul>
        </div>
      `
    },
    {
      id: "executive_summary",
      title: "Executive Summary",
      content: `
        {{#if options.executiveSummary.enabled}}
          <section id="executive_summary">
            <h2>Executive Summary</h2>
            <div class="summary-content">
              {{#if options.executiveSummary.content}}
                {{options.executiveSummary.content}}
              {{else}}
                <p>No executive summary provided.</p>
              {{/if}}
            </div>
          </section>
        {{/if}}
      `
    },
    {
      id: "timeline",
      title: "Timeline",
      content: `
        {{#if options.timeline.enabled}}
          <section id="timeline">
            <h2>Case Timeline</h2>
            <div class="timeline">
              {{#each case.activities}}
                <div class="timeline-item">
                  <div class="timeline-date">{{formatDate this.createdAt}}</div>
                  <div class="timeline-content">
                    <strong>{{this.user.name}}</strong>
                    <p>{{this.description}}</p>
                  </div>
                </div>
              {{/each}}
            </div>
          </section>
        {{/if}}
      `
    },
    {
      id: "case_details", 
      title: "Case Details",
      content: `
        <h2>Case Information</h2>
        <ul class="info-list">
          <li><strong>Case Type:</strong> {{case.caseType}}</li>
          <li><strong>Priority:</strong> {{case.casePriority}}</li>
          <li><strong>Status:</strong> {{case.status}}</li>
          <li><strong>Date Opened:</strong> {{case.caseDate}}</li>
          {{#if options.caseSummary.includeMyInfo}}
            <li><strong>Case Examiner:</strong> {{case.caseExaminer}}</li>
            <li><strong>Case Investigator:</strong> {{case.caseInvestigator}}</li>
            <li><strong>Organization:</strong> {{organization.name}}</li>
          {{/if}}
        </ul>

        {{#if options.caseSummary.includeCaseDescription}}
          <h3>Description</h3>
          <div>{{case.description}}</div>
        {{/if}}

        {{#if options.caseSummary.customSummary}}
          <h3>Custom Summary</h3>
          <div>{{options.caseSummary.customSummary}}</div>
        {{/if}}
      `
    },
    {
      id: "evidence",
      title: "Evidence Items",
      content: `
        {{#if options.evidence.enabled}}
          <section id="evidence">
            <h2>Evidence Items</h2>
            {{#each case.evidence}}
              <div class="evidence-item">
                <h3>{{this.name}}</h3>
                <ul class="info-list">
                  <li><strong>Type:</strong> {{this.type.name}}</li>
                  <li><strong>Size:</strong> {{formatFileSize this.size}}</li>
                  {{#if ../options.evidence.includeAcquisitionDate}}
                    <li><strong>Acquired:</strong> {{formatDate this.acquisitionDate}}</li>
                  {{/if}}
                  {{#if ../options.evidence.includeStorageLocation}}
                    <li><strong>Storage Location:</strong> {{this.storageLocation}}</li>
                  {{/if}}

                  {{#if ../options.evidence.includeMD5}}
                    <li><strong>MD5:</strong> {{this.md5Hash}}</li>
                  {{/if}}
                  {{#if ../options.evidence.includeSHA256}}
                    <li><strong>SHA256:</strong> {{this.sha256Hash}}</li>
                  {{/if}}
                </ul>

                {{#if ../options.evidence.includeChainOfCustody}}
                  <div class="chain-of-custody">
                    <h4>Chain of Custody</h4>
                    {{#each this.chainOfCustody}}
                      <div class="coc-entry">
                        {{formatDate this.createdAt}} - {{this.user.name}}: {{this.action}}
                      </div>
                    {{/each}}
                  </div>
                {{/if}}
              </div>
            {{/each}}
          </section>
        {{/if}}
      `
    },
    {
      id: "evidence-gallery",
      title: "Evidence Gallery", 
      content: `
        {{#if options.evidence.enabled}}
          <div class="gallery-modal" id="galleryModal">
            <span class="close-modal">&times;</span>
            <button class="nav-btn prev-btn">&lt;</button>
            <button class="nav-btn next-btn">&gt;</button>
            <img class="modal-content" id="modalImage">
            <div class="modal-caption"></div>
          </div>
          <div class="evidence-gallery">
            {{#each case.evidence}}
              {{#if this.mimeType}}
                {{#if (isImage this.mimeType)}}
                  <div class="gallery-item" onclick="openModal(this)">
                    <img src="graphics/{{this.name}}" alt="{{this.name}}">
                    <div class="caption">{{this.name}}</div>
                  </div>
                {{/if}}
              {{/if}}
            {{/each}}
          </div>
          <script>
            let currentIndex = 0;
            const images = document.querySelectorAll('.gallery-item');
            
            function openModal(element) {
              const modal = document.getElementById('galleryModal');
              const modalImg = document.getElementById('modalImage');
              const caption = document.querySelector('.modal-caption');
              
              modal.style.display = "block";
              modalImg.src = element.querySelector('img').src;
              caption.innerHTML = element.querySelector('.caption').innerHTML;
              
              currentIndex = Array.from(images).indexOf(element);
            }
            
            function closeModal() {
              document.getElementById('galleryModal').style.display = "none";
            }
            
            function navigate(direction) {
              currentIndex = (currentIndex + direction + images.length) % images.length;
              const newImage = images[currentIndex];
              const modalImg = document.getElementById('modalImage');
              const caption = document.querySelector('.modal-caption');
              
              modalImg.src = newImage.querySelector('img').src;
              caption.innerHTML = newImage.querySelector('.caption').innerHTML;
            }
            
            document.querySelector('.close-modal').onclick = closeModal;
            document.querySelector('.prev-btn').onclick = () => navigate(-1);
            document.querySelector('.next-btn').onclick = () => navigate(1);
          </script>
        {{/if}}
      `
    },
    {
      id: "activities", 
      title: "Activities",
      content: `
        {{#if options.activities.enabled}}
          <h2>Case Activities</h2>
          {{#each case.activities}}
            {{#if (or (not this.private) ../options.activities.includePrivate)}}
              <div class="activity">
                <strong>{{this.createdAt}}</strong> - {{this.user.name}}: {{this.description}}
              </div>
            {{/if}}
          {{/each}}
        {{/if}}
      `
    },
    {
      id: "notes",
      title: "Case Notes",
      content: `
        {{#if options.notes.enabled}}
          <section id="notes">
            <h2>Case Notes</h2>
            {{#each case.notes}}
              <div class="note-item">
                <h3>{{this.title}}</h3>
                <div class="note-content">
                  {{{this.content}}}
                </div>
                {{#if ../options.notes.includeAuthor}}
                  <div class="note-author">Author: {{this.user.name}}</div>
                {{/if}}
                {{#if ../options.notes.includeTimestamp}}
                  <div class="note-timestamp">Created: {{formatDate this.createdAt}}</div>
                {{/if}}
              </div>
            {{/each}}
          </section>
        {{/if}}
      `
    },
    {
      id: "methodology",
      title: "Methodology",
      content: `
        {{#if options.methodology.enabled}}
          <section id="methodology">
            <h2>Investigation Methodology</h2>
            <div class="methodology-content">
              {{#if options.methodology.content}}
                {{options.methodology.content}}
              {{else}}
                <p>No methodology information provided.</p>
              {{/if}}
            </div>
          </section>
        {{/if}}
      `
    },
    {
      id: "equipment",
      title: "Equipment",
      content: `
        {{#if options.equipment.enabled}}
          <section id="equipment">
            <h2>Equipment & Tools</h2>
            {{#if options.equipment.includeTools}}
              <h3>Software Tools</h3>
              <ul class="info-list">
                {{#each case.tools}}
                  <li>
                    <strong>{{this.name}}</strong>
                    {{#if ../options.equipment.includeVersions}}
                      - Version {{this.version}}
                    {{/if}}
                  </li>
                {{/each}}
              </ul>
            {{/if}}
          </section>
        {{/if}}
      `
    },
    {
      id: "related_cases",
      title: "Related Cases",
      content: `
        {{#if options.relatedCases.enabled}}
          <section id="related_cases">
            <h2>Related Cases</h2>
            {{#each case.relatedCases}}
              <div class="related-case">
                <h3>Case {{this.caseNumber}}</h3>
                {{#if ../options.relatedCases.includeDescription}}
                  <p>{{this.description}}</p>
                {{/if}}
              </div>
            {{/each}}
          </section>
        {{/if}}
      `
    },
    {
      id: "signature",
      title: "Signature",
      content: `
        {{#if options.signature.enabled}}
          <div class="signature-section">
            <h2>Report Authentication</h2>
            <p>This report was generated by {{user.name}} on {{currentDate}}</p>
            
            {{#if options.signature.typedSignature}}
              <div class="typed-signature">
                <p class="signature-text">{{options.signature.typedSignature}}</p>
              </div>
            {{/if}}

            {{#if options.signature.includeTitle}}
              <p class="examiner-title">{{user.title}}</p>
            {{/if}}

            {{#if options.signature.includeOrganization}}
              <p class="organization">{{organization.name}}</p>
            {{/if}}

            {{#if options.signature.includeContact}}
              <div class="contact-info">
                <p>Contact: {{user.email}}</p>
                {{#if organization.phone}}<p>Phone: {{organization.phone}}</p>{{/if}}
              </div>
            {{/if}}
          </div>
        {{/if}}
      `
    }
  ]
};

const prisma = new PrismaClient();

async function updateDefaultTemplate() {
  try {
    const template = await prisma.reportTemplate.findFirst({
      where: {
        name: "Default HTML Template"
      }
    });

    if (!template) {
      console.log('Creating new template...');
      await prisma.reportTemplate.create({
        data: {
          name: "Default HTML Template",
          description: defaultHTMLTemplate.description,
          sections: defaultHTMLTemplate.sections,
          type: defaultHTMLTemplate.type,
          category: defaultHTMLTemplate.category,
          metadata: defaultHTMLTemplate.metadata,
          version: "1.0.0"
        }
      });
    } else {
      console.log('Updating existing template...');
      await prisma.reportTemplate.update({
        where: {
          id: template.id
        },
        data: {
          sections: defaultHTMLTemplate.sections,
          metadata: defaultHTMLTemplate.metadata,
        }
      });
    }
    
    console.log('Template operation completed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDefaultTemplate();