function createPersonLink(id) {
  const person = peopleById[id];
  if (!person) return null;

  const a = document.createElement("a");
  a.href = getPersonHref(person.id);
  a.textContent = person.name || person.id;
  a.className = "person-link-inline";

  return a;
}

function renderPersonIdList(container, ids, emptyText) {
  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(ids) || ids.length === 0) {
    const li = document.createElement("li");
    li.textContent = emptyText;
    container.appendChild(li);
    return;
  }

  ids.forEach(id => {
    const li = document.createElement("li");
    const link = createPersonLink(id);

    if (link) {
      li.appendChild(link);
    } else {
      li.textContent = id;
    }

    container.appendChild(li);
  });
}

function renderSources(container, sources) {
  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(sources) || sources.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No sources recorded.";
    container.appendChild(li);
    return;
  }

  sources.forEach(src => {
    const li = document.createElement("li");

    if (typeof src === "string" && src.startsWith("http")) {
      const a = document.createElement("a");
      a.href = src;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = src;
      li.appendChild(a);
    } else {
      li.textContent = String(src);
    }

    container.appendChild(li);
  });
}

function getFirstName(person) {
  const raw = (person.name || person.id).replace(/\(.+?\)/g, "").trim();
  return raw.split(/\s+/)[0] || raw;
}

document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("person-name");
  const dobEl = document.getElementById("person-dob");
  const dodEl = document.getElementById("person-dod");
  const photoEl = document.getElementById("person-photo");
  const parentsList = document.getElementById("person-parents");
  const spousesList = document.getElementById("person-spouses");
  const childrenList = document.getElementById("person-children");
  const siblingsList = document.getElementById("person-siblings");
  const notesEl = document.getElementById("person-notes");
  const sourcesList = document.getElementById("person-sources");
  const aboutHeader = document.getElementById("about-header");

  if (!nameEl || !dobEl || !dodEl || !photoEl) return;

  const params = new URLSearchParams(window.location.search);
  const personId = params.get("id");
  const person = peopleById[personId];

  if (!person) {
    nameEl.textContent = "Person not found";
    dobEl.textContent = "";
    dodEl.textContent = "";
    photoEl.style.display = "none";

    if (notesEl) {
      notesEl.textContent = "No person matches this link.";
    }

    return;
  }

  const displayName = person.name || person.id;

  document.title = displayName;

  nameEl.textContent = displayName;

  dobEl.innerHTML = person.dob ? `<strong>Born:</strong> ${person.dob}` : "";
  dodEl.innerHTML = person.dod ? `<strong>Died:</strong> ${person.dod}` : "";

  if (aboutHeader) {
    aboutHeader.textContent = `About ${getFirstName(person)}`;
  }

  if (person.photo && person.photo.trim() !== "") {
    photoEl.src = `../imgs/${person.photo}`;
    photoEl.alt = displayName;
    photoEl.style.display = "block";
  } else {
    photoEl.style.display = "none";
  }

  renderPersonIdList(parentsList, person.parents, "No parents recorded.");
  renderPersonIdList(spousesList, person.spouse, "No spouse or partner recorded.");
  renderPersonIdList(childrenList, person.children, "No children recorded.");
  renderPersonIdList(siblingsList, person.siblings, "No siblings recorded.");

  if (notesEl) {
    notesEl.textContent =
      person.bio && person.bio.trim() !== ""
        ? person.bio
        : "No notes have been added yet for this person.";
  }

  renderSources(sourcesList, person.source);
});