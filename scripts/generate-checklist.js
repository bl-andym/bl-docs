module.exports = async (params) => {
  const { app } = params;

  const file = app.workspace.getActiveFile();
  if (!file) {
    return;
  }

  const content = await app.vault.read(file);
  const headings = content.match(/^##\s+(.*)$/gm);

  if (!headings || headings.length === 0) {
    return;
  }

  const tasks = headings.map((h) => h.replace(/^##\s+/, "").trim());

  const today = new Date().toISOString().split("T")[0];
  const outputLines = [
    `# Checklist - ${file.basename}`,
    `Source: [[${file.basename}]]`,
    "",
    ...tasks.map((task) => `- [ ] ${task}`),
  ];
  const output = outputLines.join("\n");

  const folder = "bl-docs/checklists";
  const filename = `${file.basename}-checklist-${today}.md`;
  const path = `${folder}/${filename}`;

  const existingFolder = app.vault.getAbstractFileByPath(folder);
  if (!existingFolder) {
    await app.vault.createFolder(folder);
  }

  const existingFile = app.vault.getAbstractFileByPath(path);
  if (existingFile) {
    return;
  }

  await app.vault.create(path, output);
};