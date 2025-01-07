const contract_call = async (ethers, collectAddress, collectAbi, funName, customHttpProvider, funParam) => {
  try {
    const contract = new ethers.Contract(
      collectAddress,
      collectAbi,
      customHttpProvider.getSigner()
    )
    // let contractWithSigner = contract.connect(wallet);
    const result = await contract[funName](
      ...funParam
    )
    return {
      err: null,
      data: result
    }
  }
  catch (err) {
    return {err: err, data: null}

  }

}
const contract_call_override = async (ethers, wallet, collectAddress, collectAbi, funName, customHttpProvider, funParam, override) => {
  try {
    const contract = new ethers.Contract(
      collectAddress,
      collectAbi,
      wallet
    )
    // let contractWithSigner = contract.connect(wallet);
    const result = await contract[funName](
      ...funParam, override
    )
    return {
      err: null,
      data: result
    }
  }
  catch (err) {
    return {err: err, data: null}

  }

}
const contract_static_call = async (ethers, collectAddress, collectAbi, funName, customHttpProvider, funParam) => {
  try {
    const contract = new ethers.Contract(
      collectAddress,
      collectAbi,
      customHttpProvider
    )

    const result = await contract.callStatic[funName](
      ...funParam
    )
    return {
      err: null,
      data: result
    }
  }
  catch (err) {
    return {err: err, data: null}

  }

}
const contract_static_call_override = async (ethers,
  collectAddress,
  collectAbi,
  funName,
  customHttpProvider,
  funParam,
  override) => {
  try {
    const contract = new ethers.Contract(
      collectAddress,
      collectAbi,
      customHttpProvider
    )

    const result = await contract.callStatic[funName](
      ...funParam, override
    )
    return {
      err: null,
      data: result
    }
  }
  catch (err) {
    return {err: err, data: null}

  }

}

const contract_gas_call_override = async (ethers,
  collectAddress,
  collectAbi,
  funName,
  customHttpProvider,
  funParam,
  override) => {
  try {
    const contract = new ethers.Contract(
      collectAddress,
      collectAbi,
      customHttpProvider
    )

    const result = await contract.estimateGas[funName](
      ...funParam, override
    )
    return {
      err: null,
      data: result
    }
  }
  catch (err) {
    console.trace(err)
    return {err: err, data: null}

  }

}
const contract_estimateGas_call = async (ethers, collectAddress, collectAbi, funName, customHttpProvider, funParam) => {
  try {
    const contract = new ethers.Contract(
      collectAddress,
      collectAbi,
      customHttpProvider
    )

    const result = await contract.estimateGas[funName](
      ...funParam
    )
    return {
      err: null,
      data: result
    }
  }
  catch (err) {
    return {err: err, data: null}

  }

}
module.exports = {
  contract_call,
  contract_call_override,
  contract_static_call,
  contract_static_call_override,
  contract_gas_call_override,
  contract_estimateGas_call
}
