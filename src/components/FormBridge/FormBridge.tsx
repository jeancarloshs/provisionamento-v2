"use client";
import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
import jwt_decode from "jwt-decode";
import * as React from "react";
import styles from "./FormBridge.module.css";
import UserLoged from "@/api/controller/UserLogedController";
import externalTechnician from "@/api/controller/ExternalTechnicianController";
import servicesTypes from "@/api/controller/ServicesTypesController";
import NavBar from "../NavBar/NavBar";
import tokenVerify from "@/api/middleware/tokenVerify";
import provisioningModel from "@/api/models/Provisioning";
import saveDbModel from "@/api/models/SheetsDB";
import copy from "copy-to-clipboard";
import RemoveOnuModel from "@/api/models/Remove";
import SearchByMac from "@/api/models/SearchByMac";
import SearchByPositioning from "@/api/models/SearchByPositioning";
import BridgeProvisioningWithWifiModel from "@/api/models/BridgeProvisioningWithWifi";
import BridgeProvisioningWithoutWifiModel from "@/api/models/BridgeProvisioningWithoutWifi";

export default function FormBridge() {
    const [token, setToken] = useState<String | null>("");
    const [userData, setUserData] = useState({});
    const [userInternal, setUserName] = useState<any[] | null>(null);
    const [userExternal, setUserExternal] = useState<any[] | null>(null);
    const [typesServices, setServicesTypes] = useState<any[] | null>(null);
    const [provisionamentoState, setProvisionamentoState] = useState({
        clientName: "",
        clientAddress: "",
        equipmentAssets: "",
        serialNumber: "",
        positioning: "",
        vlan: "",
        onuType: "",
        serviceType: "",
        externalTechnician: "",
        internalTechnician: "",
    });
    const [removingOnuState, setRemovingOnuState] = useState({
        positioning: "",
    });
    const [searchByPositioningState, setSearchByPositioningState] = useState({
        positioning: "",
    })
    const [searchByMacState, setSearchByMacState] = useState({
        serialNumber: "",
    });
    const [resProvisioning, setResProvisioning] = useState("");
    const [saveSheetDB, setSaveSheetsDB] = useState("");
    const [copyText, setCopyText] = useState('');

    const handleOnChangeProvisioning = (event: any, key: any) => {
        setProvisionamentoState({
            ...provisionamentoState,
            [key]: event.target.value,
        });
    };

    const handleOnChangeRemovingOnu = (event: any, key: any) => {
        setRemovingOnuState({
            ...removingOnuState,
            [key]: event.target.value
        })
    }

    const handlaOnChangeSearchByPositioning = (event: any, key: any) => {
        setSearchByPositioningState({
            ...searchByPositioningState,
            [key]: event?.target.value
        })
    }

    const handleOnChangeSearchByMac = (event: any, key: any) => {
        setSearchByMacState({
            ...searchByMacState,
            [key]: event.target.value
        })
    }

    const removeAccentuation = (text: string) => {
        const mapaAcentos: any = {
          'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
          'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
          'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
          'ã': 'a', 'õ': 'o', 'ç': 'c',
          'ä': 'a', 'ë': 'e', 'ï': 'i', 'ö': 'o', 'ü': 'u',
          'ñ': 'n'
        };
      
        const regexAcentos = /[áéíóúâêîôûàèìòùãõçäëïöüñ]/g;
      
        return text.replace(regexAcentos, (match: string | number) => mapaAcentos[match] || match);
      }

    const handleChangeTextarea = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        setResProvisioning(event.target.value);
    };

    const handleChangeSaveSheetsDb = async (event: any) => {
        event.preventDefault();
        let clientName = provisionamentoState.clientName.trim();
        let clientAddress = provisionamentoState.clientAddress.trim();
        let equipmentAssets = provisionamentoState.equipmentAssets.trim();
        let serialNumber = provisionamentoState.serialNumber.trim();
        let positioning = provisionamentoState.positioning.trim();
        let vlan = provisionamentoState.vlan.trim();
        let servicesType = provisionamentoState.serviceType.trim();
        let onuType = provisionamentoState.onuType.trim();
        let externalTechnician = provisionamentoState.externalTechnician.trim();
        let internalTechnician = provisionamentoState.internalTechnician.trim();
        let saveSheetDB: any = await saveDbModel(clientName, externalTechnician, serialNumber, positioning, equipmentAssets, servicesType, internalTechnician)
        setSaveSheetsDB(saveSheetDB);
    };

    const handleOnProvisioning = async (event: any) => {
        event.preventDefault();
        let clientName = provisionamentoState.clientName.trim();
        let clientAddress = provisionamentoState.clientAddress.trim();
        let equipmentAssets = provisionamentoState.equipmentAssets.trim();
        let serialNumber = provisionamentoState.serialNumber.trim();
        let positioning = provisionamentoState.positioning.trim();
        let vlan = provisionamentoState.vlan.trim();
        let onuType = provisionamentoState.onuType.trim();
        let servicesType = provisionamentoState.serviceType.trim();
        let externalTechnician = provisionamentoState.externalTechnician.trim();
        let internalTechnician = provisionamentoState.internalTechnician.trim();

        clientName = removeAccentuation(clientName);
        clientAddress = removeAccentuation(clientAddress);
        serialNumber = `${serialNumber.slice(0, 4)}:${serialNumber.slice(4, serialNumber.length)}`;

        if(onuType.valueOf() == 'Nokia G-240WF') {
            let data: any = await BridgeProvisioningWithWifiModel(positioning, clientName, clientAddress, equipmentAssets, vlan);
            setResProvisioning(data)
            console.log('Nokia G-240WF Com Wi-Fi', onuType);
        } else {
            let data: any = await BridgeProvisioningWithoutWifiModel(positioning, clientName, clientAddress, equipmentAssets, vlan);
            setResProvisioning(data)
            console.log(' Nokia G-010G-P Sem Wi-fi', onuType);
        }

        // let data: any = await provisioningModel(clientName, clientAddress, serialNumber, positioning);
        // setResProvisioning(data)
        // console.log("DATA", data)
    };

    const handleOnRemovingOnu = async (event: any) => {
        event.preventDefault();
        let positioning = provisionamentoState.positioning.trim();

        let data: any = RemoveOnuModel(positioning);
        setResProvisioning(data)
    }

    const handleOnSearchByPositioning = async (event: any) => {
        event.preventDefault();
        let positioning = provisionamentoState.positioning.trim();

        let data: any = SearchByPositioning(positioning);
        setResProvisioning(data)
    }

    const handleOnSearchByMac = async (event: any) => {
        event.preventDefault();
        let serialNumber = provisionamentoState.serialNumber.trim();
        serialNumber = `${serialNumber.slice(0, 4)}:${serialNumber.slice(4, serialNumber.length)}`;

        let data: any = SearchByMac(serialNumber)
        setResProvisioning(data)
    }

    const handleCopyText = () => {
        // event.preventDefault()
        alert("Copiado para area de transferencia!!")
        copy(resProvisioning);
    }

    const handleLimparDados = () => {
        setProvisionamentoState(
            {
                clientName: "",
                clientAddress: "",
                equipmentAssets: "",
                serialNumber: "",
                positioning: "",
                vlan: "",
                onuType: "",
                serviceType: "",
                externalTechnician: "",
                internalTechnician: "",
            });
        setResProvisioning("");
    };

    // tokenVerify();

    useEffect(() => {
        // Verifica se está no ambiente do navegador antes de acessar o sessionStorage
        if (typeof window !== "undefined" && window.sessionStorage) {
            const storedToken = sessionStorage.getItem("Token") as string;
            setToken(storedToken);

            // Defina o tipo da variável decodedToken para o objeto decodificado.
            interface DecodedToken {
                id: number;
                storedToken: string;
                userName: string;
            }

            // Decodifica o token e obtém os dados do usuário
            const decodedToken: DecodedToken = jwt_decode(storedToken);
            setUserData(decodedToken);

            const fetchUserLoged = async () => {
                try {
                    const id = decodedToken.id;
                    let userName = await UserLoged(storedToken, id);
                    setUserName(userName.data);
                    let external = await externalTechnician(storedToken);
                    setUserExternal(external.data);
                    let ServicesTypes = await servicesTypes(storedToken);
                    setServicesTypes(ServicesTypes.data);
                } catch (e) {
                    console.error("ERRO:", e);
                }
            };
            fetchUserLoged();
        }
    }, []);

    // Filtra apenas os instaladores
    const installers = Array.isArray(userExternal)
        ? userExternal.filter((user) => user.cargoFuncionario === "Instalador")
        : [];

    // Filtra apenas os funcionários do suporte
    const supportStaff = Array.isArray(userExternal)
        ? userExternal.filter((user) => user.cargoFuncionario === "Suporte")
        : [];

    // Verifica se userExternal é um array antes de fazer o mapeamento
    const servicesTypesOptions = Array.isArray(typesServices) ? (
        typesServices.map((type, index) => (
            <option key={index} value={type.tipoDeServico}>
                {type.tipoDeServico}
            </option>
        ))
    ) : (
        <option value="">Carregando...</option>
    );

    const userExternalOptions = Array.isArray(installers) ? (
        installers.map((user, index) => (
            <option key={index} value={user.nomeFuncionario}>
                {user.cargoFuncionario == "Instalador" ? user.nomeFuncionario : ""}
            </option>
        ))
    ) : (
        <option value="">Carregando...</option>
    );

    const userInternalOptions = Array.isArray(userInternal) ? (
        userInternal.map((user, index) => (
            <option key={index} value={user.nomeFuncionario}>
                {user.cargoFuncionario == "Suporte" ? user.nomeFuncionario : ""}
            </option>
        ))
    ) : (
        <option value="">Carregando...</option>
    );

    return (
        <>
            <div className={styles.main}>
                <div className={styles.containerForm}>
                    <form method="POST" onSubmit={handleOnProvisioning} className={styles.formProvisionamento}>
                        <label htmlFor="nome"></label>
                        <input
                            className={styles.inputProvisionamento}
                            type="text"
                            id="nome"
                            name="nome"
                            value={provisionamentoState.clientName}
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "clientName")
                            }
                            placeholder="Nome"
                            required
                        />

                        <label htmlFor="endereco"></label>
                        <input
                            className={styles.inputProvisionamento}
                            type="text"
                            id="endereco"
                            name="endereco"
                            value={provisionamentoState.clientAddress}
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "clientAddress")
                            }
                            placeholder="Endereço"
                            required
                        />

                        <label htmlFor="patrimonio"></label>
                        <input
                            className={styles.inputProvisionamento}
                            type="text"
                            name="patrimonio"
                            value={provisionamentoState.equipmentAssets}
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "equipmentAssets")
                            }
                            id="patrimonio"
                            placeholder="Patrimonio"
                            required
                        />

                        <label htmlFor="serialNumber"></label>
                        <input
                            className={styles.inputProvisionamento}
                            type="text"
                            name="serialNumber"
                            value={provisionamentoState.serialNumber}
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "serialNumber")
                            }
                            id="serialNumber"
                            placeholder="S/N"
                            required
                        />

                        <label htmlFor="posicionamento"></label>
                        <input
                            className={styles.inputProvisionamento}
                            type="text"
                            name="posicionamento"
                            value={provisionamentoState.positioning}
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "positioning")
                            }
                            id="posicionamento"
                            placeholder="Posicionamento"
                            required
                        />

                        <label htmlFor="vlan"></label>
                        <input
                            className={styles.inputProvisionamento}
                            type="text"
                            name="vlan"
                            value={provisionamentoState.vlan}
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "vlan")
                            }
                            id="vlan"
                            placeholder="Vlan"
                            required
                        />

                        <label htmlFor="tipoDeOnu" className="selectLabel"></label>
                        <select
                            name="tipoDeOnu"
                            id="tipoDeOnu"
                            value={provisionamentoState.onuType}
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "onuType")
                            }
                            className={styles.formSelect}
                            required
                        >
                            <option value="">Modelo de ONU</option>
                            <option value="Nokia G-240WF" id="NokiaWifi">Nokia G-240WF (Com WI-FI)</option>
                            <option value="Nokia G-010G-P" id="NokiaLan">Nokia G-010G-P (Sem WI-FI)</option>
                        </select>

                        <label htmlFor="tipoDeServico" className="selectLabel"></label>
                        <select
                            name="tipoDeServico"
                            id="tipoDeServico"
                            value={provisionamentoState.serviceType}
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "serviceType")
                            }
                            className={styles.formSelect}
                            required
                        >
                            <option value="">Tipo</option>
                            {servicesTypesOptions}
                        </select>

                        <label htmlFor="instalador" className="selectLabel"></label>
                        <select
                            name="instalador"
                            id="instalador"
                            value={provisionamentoState.externalTechnician}
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "externalTechnician")
                            }
                            className={styles.formSelect}
                            required
                        >
                            <option value="">Instalador</option>
                            {userExternalOptions}
                        </select>

                        <label htmlFor="suporte" className="selectLabel"></label>
                        <select
                            name="suporte"
                            id="suporte"
                            className={styles.formSelect}
                            value={provisionamentoState.internalTechnician}
                            required
                            onChange={(event) =>
                                handleOnChangeProvisioning(event, "internalTechnician")
                            }
                        >
                            <option value="">Suporte</option>
                            {userInternalOptions}
                        </select>
                    </form>
                    <button
                        type="submit"
                        id="btnProvisionar"
                        name="btnProvisionar"
                        onClick={handleOnProvisioning}
                        className={styles.btn}
                    >
                        Provisionar
                    </button>
                    <button
                        type="submit"
                        id="btnRemover"
                        name="btnProvisionar"
                        onClick={handleOnRemovingOnu}
                        className={styles.btn}
                    >
                        Remover
                    </button>
                    <br />
                    <button
                        type="submit"
                        id="btnMac"
                        name="btnMac"
                        onClick={handleOnSearchByPositioning}
                        className={styles.btn}
                    >
                        Mac
                    </button>
                    <button
                        type="submit"
                        id="btnLocalizar"
                        name="btnProvisionar"
                        onClick={handleOnSearchByMac}
                        className={styles.btn}
                    >
                        Localizar
                    </button>
                </div>
                <div className={styles.codigoGerado}>
                    <textarea
                        name="scriptOLT"
                        className={styles.scriptOLT}
                        value={resProvisioning}
                        onChange={handleChangeTextarea}
                        id="scriptOLT"
                        readOnly
                    ></textarea>
                    <button
                        type="submit"
                        id="btnLimpaInputs"
                        name="btnLimpaInputs"
                        onClick={handleLimparDados}
                        className={styles.btnProvisionamento}
                    >
                        Limpar Dados
                    </button>
                    <button
                        type="submit"
                        id="btnEnviaPlanilha"
                        name="btnEnviaPlanilha"
                        onClick={handleChangeSaveSheetsDb}
                        form="provisionamentoForm"
                        className={styles.btnProvisionamento}
                    >
                        Enviar p/ Planilha
                    </button>
                    <button
                        type="submit"
                        id="btnCopiar"
                        name="btnCopiar"
                        onClick={handleCopyText}
                        className={styles.btnProvisionamento}
                    >
                        Copiar
                    </button>
                </div>
            </div>
        </>
    );
}
