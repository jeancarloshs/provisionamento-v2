"use client";
import React from "react";
import SideBar from "@/components/SideBar/SideBar";
import OpcoesComponent from "@/components/Opcoes/OpcoesComponent";
import tokenVerify from "@/api/middleware/tokenVerify";

const Opcoes = () => {
  tokenVerify()
  return (
    <>
      <SideBar></SideBar>
      <OpcoesComponent></OpcoesComponent>
    </>
  );
};

export default Opcoes;
