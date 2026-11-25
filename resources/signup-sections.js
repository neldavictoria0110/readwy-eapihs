/* Sign-up: the Section list follows the chosen grade and uses the school's real section names,
   the same list teachers choose from in the Teacher Portal (kept equal by teacher-portal.test.cjs). */
(() => {
  const SECTIONS = {
    7: ['Aguinaldo', 'Agoncillo', 'Aquino', 'Bonifacio', 'Del Pilar', 'Escoda', 'Jacinto', 'Jaena', 'Luna', 'Mabini', 'Palma', 'Paterno', 'Ponce', 'Rizal'],
    8: ['Argon', 'Carbon', 'Gold', 'Iron', 'Krypton', 'Mercury', 'Oxygen', 'Platinum', 'Silver', 'Sodium', 'Thallium', 'Zinc'],
    9: ['Atalia', 'Balagtas', 'Bautista', 'Caparas', 'Galang', 'Gonzales', 'Hernandez', 'Joaquin', 'Ravelo', 'Reyes', 'Santos', 'Villa', 'Open High'],
    10: ['Alcala', 'Alcaraz', 'Almeda', 'Banzon', 'Belardo', 'Campos', 'Concepcion', 'Flores', 'Olivera', 'Quisumbing', 'Vergara', 'Open High'],
    11: ['Magsaysay', 'Osmeña', 'Quezon', 'Quirino', 'Lev', 'Peso', 'Diamond', 'Sapphire', 'Daza', 'Escalante', 'Sison', 'RAM', 'ROM'],
    12: ['Emerald', 'Yen', 'Euro', 'Abueva', 'Nakpil', 'Amorsolo', 'Joaquin', 'Flores', 'Benitez', 'Royol', 'Windows', 'Linux', 'Ampere', 'Farad']
  };
  function fill(form) {
    const grade = form?.elements.grade, section = form?.elements.section;
    if (!grade || !section || section.tagName !== 'SELECT') return;
    const names = SECTIONS[Number(grade.value)] || [];
    const keep = names.includes(section.value) ? section.value : '';
    section.innerHTML = '';
    const placeholder = new Option(names.length ? 'Section' : 'Choose grade first', '', !keep, !keep);
    placeholder.disabled = true;
    section.add(placeholder);
    for (const name of names) section.add(new Option(name, name, false, name === keep));
  }
  document.addEventListener('change', event => {
    if (event.target.name === 'grade' && event.target.form?.id === 'signup') fill(event.target.form);
  });
  fill(document.getElementById('signup'));
})();
