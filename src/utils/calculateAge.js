/**
 * Calcula la edad de una persona basada en su fecha de nacimiento
 * @param {string} birthDate - Fecha de nacimiento en formato ISO (YYYY-MM-DD)
 * @returns {number} La edad en años
 */
function calculateAge(birthDate) {
  const birthDateObj = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDifference = today.getMonth() - birthDateObj.getMonth();
  
  // Si aún no ha cumplido años este año, restar 1
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Verifica si una persona es mayor de edad (18 años o más)
 * @param {string} birthDate - Fecha de nacimiento en formato ISO (YYYY-MM-DD)
 * @returns {boolean} true si es mayor de edad, false si no
 */
function isAdult(birthDate) {
  return calculateAge(birthDate) >= 18;
}

module.exports = {
  calculateAge,
  isAdult,
};
