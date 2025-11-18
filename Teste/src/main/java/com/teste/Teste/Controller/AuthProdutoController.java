package com.teste.Teste.Controller;

import com.teste.Teste.Model.Produto;
import com.teste.Teste.Service.ProdutoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public List<Produto> Buscar(){
        return produtoService.buscarProduto();
    }

    @PostMapping
    public Produto savar(@RequestBody Produto produto){
        return produtoService.savar(produto);
    }

    @GetMapping("/{id}")
    public Produto buscarPorId(@PathVariable Long id){
        return produtoService.BuscarPorId(id);
    }

    @GetMapping("/{id}")
    public void deletar(@PathVariable Long id){
         produtoService.deletar(id);
    }

}
