// ==UserScript==
// @name         SCA Dashboard Auto-Fill
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @description  Auto-fill missing time entries on SCA dashboard
// @author       liancastro
// @copyright    2025, Lian castro
// @match        http://sca.saude.ba.gov.br/dashboard/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gov.br
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    "use strict";
    const HORARIO_COMPLETO = "09:00";
    const HORARIO_ALMOCO = "01:00";
    const INICIO_ALMOCO = "12:00";
    const FIM_ALMOCO = "13:00";
    let COMPENSAR_HORAS = "00:00";

    window.onload = () => {
        const table = document.getElementById("datatableTest");
        if (!table) return;

        for (let i = 1; i < table.rows.length - 1; i++) {
            const cell = table.rows[i].cells[table.rows[i].cells.length - 2].textContent;
            if (cell && (table.rows[i].cells.length > 4 
                        || hasTwoOrMoreButtonChildren(table.rows[i].cells[table.rows[i].cells.length - 1]))) {
                COMPENSAR_HORAS = addTimes(COMPENSAR_HORAS, cell);
            }
        }
        COMPENSAR_HORAS = COMPENSAR_HORAS.replace("-", "");

        const lastRow = table.rows[table.rows.length - 1];
        lastRow.style.backgroundColor = "#B2E0B6";
        const cells = lastRow.cells;

        const [
            entrada1,
            saida1,
            entrada2,
            saida2,
            entrada3,
            saida3,
            total,
            saldo,
        ] = [
            cells[1],
            cells[2],
            cells[3],
            cells[4],
            cells[5],
            cells[6],
            cells[7],
            cells[8],
        ];

        let resultado = "";

        if (isZero(saida1.textContent)) {
            resultado = addTimes(HORARIO_COMPLETO, entrada1.textContent);
            saida2.textContent = resultado;
            saida1.textContent = INICIO_ALMOCO;
            entrada2.textContent = FIM_ALMOCO;
            checkCompensacao();
            setBold([entrada2, saida2, saida1]);
        } else if (isZero(entrada2.textContent)) {
            entrada2.textContent = addTimes(HORARIO_ALMOCO, saida1.textContent);
            resultado = addTimes(
                entrada2.textContent,
                saldo.textContent.replace("-", "")
            );
            saida2.textContent = resultado;
            checkCompensacao();
            setBold([entrada2, saida2]);
        } else {
            saida2.textContent = addTimes(
                entrada2.textContent,
                saldo.textContent.replace("-", "")
            );
            checkCompensacao();
            setBold([saida2]);
        }

        function checkCompensacao() {
            if (!isZero(COMPENSAR_HORAS)) {
                saida2.textContent +=
                    " / " + addTimes(saida2.textContent, COMPENSAR_HORAS);
            }
        }
    };

    function addTimes(time1, time2) {
        const total = toMinutes(time1) + toMinutes(time2);
        const isNegative = total < 0;
        const absTotal = Math.abs(total);
        const hours = Math.floor(absTotal / 60);
        const minutes = absTotal % 60;
        const formatted = `${hours}:${String(minutes).padStart(2, "0")}`;
        return isNegative ? `-${formatted}` : formatted;
    }

    function toMinutes(time) {
        const isNegative = time.startsWith("-");
        const [h, m] = time.replace("-", "").split(":").map(Number);
        const total = h * 60 + m;
        return isNegative ? -total : total;
    }

    function isZero(time) {
        const [h, m] = time.split(":").map(Number);
        return h === 0 && m === 0;
    }

    function setBold(cells) {
        for (let cell of cells) {
            cell.style.fontWeight = "bold";
        }
    }
    
    function hasTwoOrMoreButtonChildren(parentElement) {
        if (!parentElement || !parentElement.children) {
            return false; // Handle cases where parentElement is null or has no children
        }

        let buttonCount = 0;
        for (const child of parentElement.children) {
            if (child.tagName === 'BUTTON') { // Check if the child's tag name is 'BUTTON'
                buttonCount++;
            }
            if (buttonCount >= 2) {
                return true; // Found two or more buttons
            }
        }
        return false; // Less than two buttons found
    }
})();
