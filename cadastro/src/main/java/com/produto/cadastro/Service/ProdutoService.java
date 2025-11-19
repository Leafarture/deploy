package com.produto.cadastro.Service;

import com.produto.cadastro.Interface.ProdutoRepository;
import com.produto.cadastro.Produtos.Produto;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class AuthProdutoService {

    private final ProdutoRepository produtoRepository;

    public AuthProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    public List<Produto> ListaDeProduto() {
        return produtoRepository.findAll();
    }

    public Produto cadastarProduto(Produto produto){
        return produtoRepository.save(produto);
    }
    public void excluirProduto(Long id){
        produtoRepository.deleteById(id);
    }
    public Produto BuscarProdutoId(Long id){
        return produtoRepository.findById(id).orElse(null);
    }
}



