const api = "https://mindicador.cl/api/";

async function getCurrency() {
    try {
        const res = await fetch(api);
        const data = await res.json();
        const dolar = data.dolar.valor;
        const euro = data.euro.valor;
        return { us: dolar, eu: euro };
    } catch (error) {
        console.error("Error fetching currency data:", error);
        throw new Error("Failed to fetch currency data.");
    }
}

const convertButton = document.getElementById("convertButton");
const input = document.getElementById("amount");
const currencyOptions = document.getElementById("currency");
const result = document.getElementById("result");

let selectedCurrencyName = ""; 

convertButton.addEventListener("click", async () => {
    try {
        if (!input.value || isNaN(input.value)) {
            throw new Error("Invalid input. Please enter a valid number.");
        }

        const inputValue = parseInt(input.value);
        const resultado = await operation(inputValue);
        const formatedCurrency = formatCurrency(resultado);

        selectedCurrencyName = currencyOptions.value === "eu" ? "Euro" : "Dólar";

        showResult(inputValue.toLocaleString("es-CL", {
            style: "currency",
            currency: "CLP",
        }), formatedCurrency);
    } catch (error) {
        console.error("Conversion error:", error);
        alert("Something went wrong. Please try again later.");
    }
    input.value = "";
});

function showResult(localCurrency, formatedCurrency) {
    result.innerHTML = `${localCurrency} Pesos chilenos son ${formatedCurrency} ${selectedCurrencyName}`;
}

function formatCurrency(resultado) {
    let currencyFormat = "en-US";
    let currencyZone = "USD";
    let currencyName = "dolar";
    if (currencyOptions.value === "eu") {
        currencyFormat = "es-ES";
        currencyZone = "EUR";
        currencyName = "euro";
    }

    const formatedCurrency = resultado.toLocaleString(currencyFormat, {
        style: "currency",
        currency: currencyZone,
    });

    renderChart(currencyName, currencyZone);
    return formatedCurrency;
}

async function operation(inputValue) {
    try {
        const valores = await getCurrency();
        return inputValue / valores[currencyOptions.value];
    } catch (error) {
        console.error("Error performing currency conversion:", error);
        throw new Error("Failed to perform currency conversion.");
    }
}

async function renderChart(currency, zone) {
    try {
        const response = await fetch(`https://mindicador.cl/api/${currency}`);
        const data = await response.json();
        const last10DaysData = data.serie.slice(-10);
        const categories = last10DaysData.map(dayData =>
            new Date(dayData.fecha).toLocaleDateString("es-ES")
        );
        const values = last10DaysData.map(dayData => dayData.valor);

        Highcharts.chart("chart", {
            title: {
                text: "Exchange Rate",
            },
            xAxis: {
                categories: categories,
            },
            yAxis: {
                title: {
                    text: `Exchange Rate ${zone}`,
                },
            },
            series: [
                {
                    name: `Currency ${zone}`,
                    data: values,
                },
            ],
        });
    } catch (error) {
        console.error("Error rendering chart:", error);
        throw new Error("Failed to render chart.");
    }
}