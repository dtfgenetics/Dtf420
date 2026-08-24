const sections = window.THC_ATLAS_SECTIONS || [];
const leafPages = window.THC_LEAF_PAGES || [];
const byId = Object.fromEntries(sections.map(section => [section.id, section]));
const panel = document.getElementById("info-panel");

function renderSection(id) {
  const section = byId[id] || byId.leaves;
  document.querySelectorAll(".hotspot").forEach(button => {
    button.classList.toggle("active", button.dataset.section === section.id);
  });

  panel.innerHTML = `
    <p class="eyebrow">Atlas Section</p>
    <h2>${section.label}</h2>
    <p>${section.summary}</p>
    <div class="notice"><strong>First production asset:</strong> ${section.firstAsset}</div>
    <h3>Core topics</h3>
    <ul>${section.topics.map(topic => `<li>${topic}</li>`).join("")}</ul>
    <div class="notice"><strong>Diagnostic rule:</strong> A symptom is evidence, not proof. Confirm with measurements, root-zone context, plant stage, pest inspection, and recent changes.</div>
  `;
}

function renderLeafCards() {
  const cardWrap = document.getElementById("leaf-cards");
  cardWrap.innerHTML = leafPages.map(page => `
    <article class="card">
      <span class="badge">${page.type}</span>
      <h3>${page.title}</h3>
      <p>${page.summary}</p>
      <p><strong>First asset:</strong> ${page.asset}</p>
    </article>
  `).join("");
}

document.querySelectorAll(".hotspot").forEach(button => {
  button.addEventListener("click", () => renderSection(button.dataset.section));
});

renderSection("leaves");
renderLeafCards();
