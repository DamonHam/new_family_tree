function normalizeParentPair(parentIds) {
  return [...parentIds].sort().join("|");
}

function getFamilyUnitByParents(parentIds) {
  const key = normalizeParentPair(parentIds);

  const children = people.filter(person => {
    if (!Array.isArray(person.parents) || person.parents.length < 2) return false;
    return normalizeParentPair(person.parents) === key;
  });

  if (children.length === 0) {
    return null;
  }

  return {
    key,
    parents: [...parentIds],
    children: children.map(child => child.id)
  };
}

function getChildFamilyUnits(parentId) {
  const unitsByKey = new Map();

  people.forEach(person => {
    if (!Array.isArray(person.parents) || person.parents.length < 2) return;
    if (!person.parents.includes(parentId)) return;

    const key = normalizeParentPair(person.parents);

    if (!unitsByKey.has(key)) {
      unitsByKey.set(key, {
        key,
        parents: [...person.parents],
        children: []
      });
    }

    unitsByKey.get(key).children.push(person.id);
  });

  return [...unitsByKey.values()];
}

function createPersonBox(personId, theme) {
  const person = peopleById[personId];
  if (!person) return null;

  const link = document.createElement("a");
  link.className = `person-box ${theme}`;
  link.href = getPersonHref(person.id);

  const name = document.createElement("span");
  name.className = "person-box-name";
  name.textContent = person.name || person.id;

  link.appendChild(name);

  return link;
}

function createParentPair(parentIds, theme) {
  const parentPair = document.createElement("div");
  parentPair.className = "parent-pair";

  parentIds.forEach(parentId => {
    const box = createPersonBox(parentId, theme);
    if (box) parentPair.appendChild(box);
  });

  return parentPair;
}

function renderFamilyUnit(unit, theme, visited = new Set()) {
  if (!unit || visited.has(unit.key)) return null;

  const nextVisited = new Set(visited);
  nextVisited.add(unit.key);

  const li = document.createElement("li");
  li.className = "family-unit";

  li.appendChild(createParentPair(unit.parents, theme));

  if (unit.children.length > 0) {
    const childrenUl = document.createElement("ul");

    unit.children.forEach(childId => {
      const childUnits = getChildFamilyUnits(childId);

      if (childUnits.length > 0) {
        childUnits.forEach(childUnit => {
          const nested = renderFamilyUnit(childUnit, theme, nextVisited);
          if (nested) childrenUl.appendChild(nested);
        });
      } else {
        const childLi = document.createElement("li");
        childLi.className = "single-person-node";

        const childBox = createPersonBox(childId, theme);
        if (childBox) childLi.appendChild(childBox);

        childrenUl.appendChild(childLi);
      }
    });

    li.appendChild(childrenUl);
  }

  return li;
}

function renderFamilyTree(options) {
  const { rootParents, containerId, theme } = options;

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const rootUnit = getFamilyUnitByParents(rootParents);

  if (!rootUnit) {
    const empty = document.createElement("li");
    empty.textContent = "No family data found for this tree.";
    container.appendChild(empty);
    return;
  }

  const tree = renderFamilyUnit(rootUnit, theme || "default");
  if (tree) container.appendChild(tree);
}

function setupTreeZoom(treeCanvasId) {
  const tree = document.getElementById(treeCanvasId);
  const zoomIn = document.getElementById("zoom-in");
  const zoomOut = document.getElementById("zoom-out");
  const zoomReset = document.getElementById("zoom-reset");

  if (!tree || !zoomIn || !zoomOut || !zoomReset) return;

  let zoom = window.innerWidth <= 768 ? 0.65 : 1;

  function applyZoom() {
    tree.style.transform = `scale(${zoom})`;
    tree.style.transformOrigin = "top center";
  }

  zoomIn.addEventListener("click", () => {
    zoom = Math.min(1.8, zoom + 0.1);
    applyZoom();
  });

  zoomOut.addEventListener("click", () => {
    zoom = Math.max(0.35, zoom - 0.1);
    applyZoom();
  });

  zoomReset.addEventListener("click", () => {
    zoom = window.innerWidth <= 768 ? 0.65 : 1;
    applyZoom();
  });

  applyZoom();
}